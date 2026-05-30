/* Endpoint: /api/login */
import {
    COOKIE_KEYS,
    getCookieObject,
    hashPassword,
    onlyMethods,
    readJsonBody,
    responseError,
    responseOk,
    setCookieObject
} from './_lib/auth-utils.js'
import { ensureSalesforceSession } from './_lib/salesforce.js'

const SITE_SESSION_TTL_SECONDS = 60 * 60 * 8

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    // Parse login credentials from the request body.
    const body = readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
        return responseError(res, 400, 'Email and password are required')
    }

    // Validate against the verified registration cookie for this cookie-only phase.
    const verifiedUser = getCookieObject(req, COOKIE_KEYS.VERIFIED_USER)
    if (!verifiedUser || verifiedUser.email !== email) {
        return responseError(res, 401, 'User not found or not verified')
    }

    const incomingHash = hashPassword(password)
    if (verifiedUser.passwordHash !== incomingHash) {
        return responseError(res, 401, 'Invalid credentials')
    }

    // Ensure Salesforce token cookie is available so next API calls can reuse it.
    let salesforceConnected = true
    try {
        await ensureSalesforceSession(req, res)
    } catch {
        salesforceConnected = false
    }

    // Store site session details in encrypted HttpOnly cookie.
    setCookieObject(
        res,
        COOKIE_KEYS.SITE_SESSION,
        {
            email: verifiedUser.email,
            firstName: verifiedUser.firstName,
            lastName: verifiedUser.lastName,
            company: verifiedUser.company,
            loginAt: Math.floor(Date.now() / 1000)
        },
        SITE_SESSION_TTL_SECONDS
    )

    return responseOk(res, {
        message: 'Logged in successfully',
        salesforceConnected,
        user: {
            email: verifiedUser.email,
            firstName: verifiedUser.firstName,
            lastName: verifiedUser.lastName,
            company: verifiedUser.company
        }
    })
}