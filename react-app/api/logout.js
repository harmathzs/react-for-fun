/* Endpoint: /api/logout */
import {
    COOKIE_KEYS,
    clearCookieObject,
    getCookieObject,
    onlyMethods,
    responseOk
} from './_lib/auth-utils.js'
import {
    ensureSalesforceSession,
    escapeSoql,
    querySalesforce,
    updateSalesforceRecord
} from './_lib/salesforce.js'

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    const currentSession = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)

    // Best-effort session revocation in Salesforce for auditable logout.
    if (currentSession?.sessionToken) {
        try {
            const sf = await ensureSalesforceSession(req, res)
            const sessionRows = await querySalesforce(
                sf,
                `SELECT Id FROM Webshop_Session__c WHERE Session_Id__c = '${escapeSoql(currentSession.sessionToken)}' AND Active__c = true LIMIT 1`
            )

            if (sessionRows[0]?.Id) {
                await updateSalesforceRecord(sf, 'Webshop_Session__c', sessionRows[0].Id, {
                    Active__c: false,
                    Revoked_At__c: new Date().toISOString()
                })
            }
        } catch {
            // Ignore Salesforce logout errors so cookie cleanup still succeeds.
        }
    }

    // Clear all cookie-only auth/session artifacts.
    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION)

    return responseOk(res, { message: 'Logged out successfully' })
}