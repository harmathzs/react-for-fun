/* Endpoint: /api/login */
import crypto from 'crypto'
import {
    COOKIE_KEYS,
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
    querySalesforce,
    updateSalesforceRecord
} from './_lib/salesforce.js'

const SITE_SESSION_TTL_SECONDS = 60 * 60 * 8

export default async function handler(req, res) {
    const traceId = `login_${Date.now()}_${Math.floor(Math.random() * 100000)}`

    if (!onlyMethods(req, res, ['POST'])) return

    // Parse login credentials from the request body.
    const body = readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    console.log('[login] start', {
        traceId,
        emailDomain: email.includes('@') ? email.split('@')[1] : null
    })

    if (!email || !password) {
        return responseError(res, 400, 'Email and password are required')
    }

    // Ensure Salesforce token cookie is available because login reads Webshop_User from Salesforce.
    let sf
    try {
        sf = await ensureSalesforceSession(req, res)
    } catch (error) {
        return responseError(res, 502, error.message)
    }

    // Query webshop user by email and validate account state.
    const users = await querySalesforce(
        sf,
        `SELECT Id, Email__c, Username__c, First_Name__c, Last_Name__c, Company__c, Password_Hash__c, Status__c, Email_Verified__c, Failed_Login_Count__c FROM Webshop_User__c WHERE Email__c = '${escapeSoql(email)}' LIMIT 1`
    )

    const user = users[0]
    if (!user) {
        return responseError(res, 401, 'User not found')
    }

    if (user.Status__c !== 'Active' || !user.Email_Verified__c) {
        return responseError(res, 403, 'User is not verified or not active')
    }

    const incomingHash = hashPassword(password)
    if (user.Password_Hash__c !== incomingHash) {
        // Increment failed logins as a simple lockout signal source.
        const nextFailedCount = Number(user.Failed_Login_Count__c || 0) + 1
        await updateSalesforceRecord(sf, 'Webshop_User__c', user.Id, {
            Failed_Login_Count__c: nextFailedCount
        })
        return responseError(res, 401, 'Invalid credentials')
    }

    // Reset failed count and update last login timestamp.
    await updateSalesforceRecord(sf, 'Webshop_User__c', user.Id, {
        Failed_Login_Count__c: 0,
        Last_Login_At__c: new Date().toISOString()
    })

    // Create a dedicated Webshop_Session record for audit and future revocation.
    // Do NOT write formula/read-only fields like `Active__c`. Ensure timestamps
    // and Expires_At__c are present so the formula can evaluate correctly.
    const sessionToken = crypto.randomUUID()
    const sessionIssuedAt = new Date()
    const sessionExpiresAt = new Date(Date.now() + SITE_SESSION_TTL_SECONDS * 1000)

    let sessionCreateResult = null
    try {
        sessionCreateResult = await createSalesforceRecord(sf, 'Webshop_Session__c', {
            Webshop_User__c: user.Id,
            Session_Id__c: sessionToken,
            Issued_At__c: sessionIssuedAt.toISOString(),
            Expires_At__c: sessionExpiresAt.toISOString(),
            Last_Seen_At__c: sessionIssuedAt.toISOString()
        })
        console.log('[login] session create response', { traceId, sessionCreateResult })
    } catch (err) {
        console.error('[login] session create error', { traceId, error: err && err.message ? err.message : err, raw: err })
    }

    // Store site session details in encrypted HttpOnly cookie.
    setCookieObject(
        res,
        COOKIE_KEYS.SITE_SESSION,
        {
            webshopUserId: user.Id,
            sessionToken,
            email: user.Email__c,
            username: user.Username__c,
            firstName: user.First_Name__c,
            lastName: user.Last_Name__c,
            company: user.Company__c,
            loginAt: Math.floor(Date.now() / 1000),
            expiresAt: Math.floor(Date.now() / 1000) + SITE_SESSION_TTL_SECONDS
        },
        SITE_SESSION_TTL_SECONDS
    )

    console.log('[login] success', {
        traceId,
        webshopUserId: user.Id,
        email: user.Email__c
    })

    return responseOk(res, {
        message: 'Logged in successfully',
        salesforceConnected: true,
        user: {
            id: user.Id,
            email: user.Email__c,
            username: user.Username__c,
            firstName: user.First_Name__c,
            lastName: user.Last_Name__c,
            company: user.Company__c
        }
    })
}