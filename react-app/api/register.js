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
import {
    createSalesforceRecord,
    ensureSalesforceSession,
    escapeSoql,
    querySalesforce
} from './_lib/salesforce.js'

const PENDING_REGISTRATION_TTL_SECONDS = 60 * 30

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

    // Keep local cookie duplicate checks for this browser session.
    const existingCookieUser = getCookieObject(req, COOKIE_KEYS.VERIFIED_USER)
    if (existingCookieUser?.email === email) {
        return responseError(res, 409, 'User already exists, please login')
    }

    // Create Salesforce session first because register now writes real Webshop_User records.
    let sf
    try {
        sf = await ensureSalesforceSession(req, res)
    } catch (error) {
        return responseError(res, 502, error.message)
    }

    // Search existing webshop users by email to avoid duplicate registrations.
    const existingUsers = await querySalesforce(
        sf,
        `SELECT Id, Email__c FROM Webshop_User__c WHERE Email__c = '${escapeSoql(email)}' LIMIT 1`
    )

    if (existingUsers.length > 0) {
        return responseError(res, 409, 'User already exists, please login')
    }

    // Create a short verification code and store a pending registration cookie.
    const verificationCode = createShortCode()
    const pendingRegistration = {
        email,
        firstName,
        lastName,
        company,
        username: String(body.username || email).trim().toLowerCase(),
        passwordHash: hashPassword(password),
        verificationCode,
        expiresAt: Math.floor(Date.now() / 1000) + PENDING_REGISTRATION_TTL_SECONDS
    }

    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)

    // Create the Webshop_User record in Salesforce with pending verification status.
    const created = await createSalesforceRecord(sf, 'Webshop_User__c', {
        Email__c: email,
        First_Name__c: firstName,
        Last_Name__c: lastName,
        Company__c: company,
        Username__c: pendingRegistration.username,
        Password_Hash__c: pendingRegistration.passwordHash,
        Status__c: 'Pending_Verification',
        Email_Verified__c: false,
        Failed_Login_Count__c: 0,
        Salesforce_User__c: globalThis?.process?.env?.SALESFORCE_INTEGRATION_USER_ID || null
    })

    pendingRegistration.webshopUserId = created.id
    setCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION, pendingRegistration, PENDING_REGISTRATION_TTL_SECONDS)

    // Return verification code only for local/dev testing until email sender is added.
    const includeCode = globalThis?.process?.env?.NODE_ENV !== 'production'

    return responseOk(res, {
        message: 'Registration started. Please verify your email before login.',
        webshopUserId: created.id,
        ...(includeCode ? { verificationCode } : {})
    })
}