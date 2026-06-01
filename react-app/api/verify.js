/* Endpoint: /api/verify */
import {
    COOKIE_KEYS,
    clearCookieObject,
    getCookieObject,
    onlyMethods,
    readJsonBody,
    responseError,
    responseOk,
    setCookieObject
} from './_lib/auth-utils.js'
import {
    ensureSalesforceSession,
    escapeSoql,
    querySalesforce,
    updateSalesforceRecord
} from './_lib/salesforce.js'

const VERIFIED_USER_TTL_SECONDS = 60 * 60 * 24 * 30
const SITE_SESSION_TTL_SECONDS = 60 * 60 * 8

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    // Read submitted verification details.
    const body = readJsonBody(req)
    const code = String(body.code || '').trim()

    if (!code) {
        return responseError(res, 400, 'Verification code is required')
    }

    // Check pending registration from encrypted server-side cookie.
    const pending = getCookieObject(req, COOKIE_KEYS.PENDING_REGISTRATION)
    if (!pending) {
        return responseError(res, 404, 'No pending registration found')
    }

    const now = Math.floor(Date.now() / 1000)
    if (pending.expiresAt < now) {
        clearCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION)
        return responseError(res, 410, 'Verification code expired, please register again')
    }

    if (pending.verificationCode !== code) {
        return responseError(res, 401, 'Invalid verification code')
    }

    // Load and activate the matching Salesforce Webshop_User record.
    let sf
    try {
        sf = await ensureSalesforceSession(req, res)
    } catch (error) {
        return responseError(res, 502, error.message)
    }

    let userId = pending.webshopUserId
    if (!userId) {
        const matchedUsers = await querySalesforce(
            sf,
            `SELECT Id FROM Webshop_User__c WHERE Email__c = '${escapeSoql(pending.email)}' ORDER BY CreatedDate DESC LIMIT 1`
        )
        userId = matchedUsers[0]?.Id
    }

    if (!userId) {
        return responseError(res, 404, 'No Webshop user record found for verification')
    }

    await updateSalesforceRecord(sf, 'Webshop_User__c', userId, {
        Status__c: 'Active',
        Email_Verified__c: true,
        Email_Verified_At__c: new Date().toISOString()
    })

    // Promote pending registration into verified profile cookie.
    const verifiedUser = {
        id: userId,
        email: pending.email,
        firstName: pending.firstName,
        lastName: pending.lastName,
        company: pending.company,
        username: pending.username,
        passwordHash: pending.passwordHash,
        verifiedAt: now
    }

    setCookieObject(res, COOKIE_KEYS.VERIFIED_USER, verifiedUser, VERIFIED_USER_TTL_SECONDS)
    clearCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION)

    // Bootstrap a signed session so verified user can use protected routes immediately.
    setCookieObject(
        res,
        COOKIE_KEYS.SITE_SESSION,
        {
            email: verifiedUser.email,
            firstName: verifiedUser.firstName,
            lastName: verifiedUser.lastName,
            company: verifiedUser.company,
            loginAt: now
        },
        SITE_SESSION_TTL_SECONDS
    )

    return responseOk(res, {
        message: 'Email verified successfully. You are now logged in.',
        user: {
            email: verifiedUser.email,
            firstName: verifiedUser.firstName,
            lastName: verifiedUser.lastName,
            company: verifiedUser.company
        }
    })
}