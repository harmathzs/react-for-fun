/* Endpoint: /api/register */
import {
    COOKIE_KEYS,
    clearCookieObject,
    createShortCode,
    getCookieObject,
    hashPassword,
    onlyMethods,
    readJsonBody,
    responseError,
    responseOk,
    setCookieObject
} from './_lib/auth-utils.js'
import { callSalesforceApi, ensureSalesforceSession } from './_lib/salesforce.js'

const PENDING_REGISTRATION_TTL_SECONDS = 60 * 30

async function tryCreateSalesforceRegistration(req, res, payload) {
    // This is a best-effort Salesforce write so register can still work without full CRM setup.
    try {
        const sf = await ensureSalesforceSession(req, res)
        await callSalesforceApi(sf, '/services/data/v61.0/sobjects/Webshop_Registration__c', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    } catch {
        // Ignore CRM write issues for now; user registration remains cookie-only until backend is completed.
    }
}

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    // Parse the registration request body from Vercel runtime.
    const body = readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const company = String(body.company || '').trim()

    // Validate mandatory fields for basic registration quality.
    if (!email || !password || !firstName || !lastName || !company) {
        return responseError(res, 400, 'Missing required registration fields')
    }

    if (password.length < 8) {
        return responseError(res, 400, 'Password must be at least 8 characters long')
    }

    // Prevent duplicate registration for the same user in this cookie-only phase.
    const existing = getCookieObject(req, COOKIE_KEYS.VERIFIED_USER)
    if (existing?.email === email) {
        return responseError(res, 409, 'User already exists, please login')
    }

    // Create a short verification code and store a pending registration cookie.
    const verificationCode = createShortCode()
    const pendingRegistration = {
        email,
        firstName,
        lastName,
        company,
        passwordHash: hashPassword(password),
        verificationCode,
        expiresAt: Math.floor(Date.now() / 1000) + PENDING_REGISTRATION_TTL_SECONDS
    }

    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)
    setCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION, pendingRegistration, PENDING_REGISTRATION_TTL_SECONDS)

    // Optionally create a placeholder custom object record in Salesforce for visibility.
    await tryCreateSalesforceRegistration(req, res, {
        Email__c: email,
        First_Name__c: firstName,
        Last_Name__c: lastName,
        Company__c: company,
        Verification_Status__c: 'Unverified'
    })

    // Return verification code only for local/dev testing until email sender is added.
    const includeCode = globalThis?.process?.env?.NODE_ENV !== 'production'

    return responseOk(res, {
        message: 'Registration started. Please verify your email before login.',
        ...(includeCode ? { verificationCode } : {})
    })
}