/* Endpoint: /api/salesforce-auth */
import {
    COOKIE_KEYS,
    clearCookieObject,
    onlyMethods,
    responseError,
    responseOk
} from './_lib/auth-utils.js'
import { ensureSalesforceSession, getSalesforceSession } from './_lib/salesforce.js'

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['GET', 'POST', 'DELETE'])) return

    if (req.method === 'GET') {
        // Return Salesforce auth status without exposing token details.
        const session = getSalesforceSession(req)
        const now = Math.floor(Date.now() / 1000)
        const isAuthenticated = !!session?.accessToken && Number(session?.expiresAt || 0) > now

        return responseOk(res, {
            authenticated: isAuthenticated,
            instanceUrl: session?.instanceUrl || null,
            expiresAt: session?.expiresAt || null
        })
    }

    if (req.method === 'POST') {
        // Create or refresh Salesforce session cookie for subsequent API requests.
        try {
            const sf = await ensureSalesforceSession(req, res)
            return responseOk(res, {
                message: 'Salesforce session is ready',
                authenticated: true,
                instanceUrl: sf.instanceUrl,
                expiresAt: sf.expiresAt
            })
        } catch (error) {
            return responseError(res, 502, error.message)
        }
    }

    // Clear only the Salesforce session cookie.
    clearCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION)
    return responseOk(res, { message: 'Salesforce session cleared' })
}