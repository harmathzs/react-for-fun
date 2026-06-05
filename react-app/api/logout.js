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
            try {
                // Primary: try to find by Session_Id__c (may be non-filterable in some orgs).
                const sessionRows = await querySalesforce(
                    sf,
                    `SELECT Id FROM Webshop_Session__c WHERE Session_Id__c = '${escapeSoql(currentSession.sessionToken)}' AND Active__c = true LIMIT 1`
                )

                if (sessionRows[0]?.Id) {
                    await updateSalesforceRecord(sf, 'Webshop_Session__c', sessionRows[0].Id, {
                        Revoked_At__c: new Date().toISOString()
                    })
                }
            } catch (err) {
                // Fallback: some fields (e.g. Session_Id__c) may not be filterable.
                // Query recent sessions for the user and match client-side.
                console.warn('[logout] primary session query failed, falling back', { error: err && err.message ? err.message : err })
                if (currentSession?.webshopUserId) {
                    const rows = await querySalesforce(
                        sf,
                        `SELECT Id, Session_Id__c FROM Webshop_Session__c WHERE Webshop_User__c = '${escapeSoql(currentSession.webshopUserId)}' ORDER BY CreatedDate DESC LIMIT 20`
                    )
                    const match = rows.find(r => r.Session_Id__c === currentSession.sessionToken)
                    if (match?.Id) {
                        await updateSalesforceRecord(sf, 'Webshop_Session__c', match.Id, {
                            Revoked_At__c: new Date().toISOString()
                        })
                    }
                }
            }
        } catch (outerErr) {
            // Ignore Salesforce logout errors so cookie cleanup still succeeds.
            console.warn('[logout] Salesforce revoke error', { error: outerErr && outerErr.message ? outerErr.message : outerErr })
        }
    }

    // Clear all cookie-only auth/session artifacts.
    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION)

    return responseOk(res, { message: 'Logged out successfully' })
}