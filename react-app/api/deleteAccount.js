import { getCookieObject, onlyMethods, clearCookieObject, COOKIE_KEYS } from './_lib/auth-utils.js'
import { ensureSalesforceSession, callSalesforceApi } from './_lib/salesforce.js'

export default async function handler(req, res) {
  if (!onlyMethods(req, res, ['POST'])) return

  try {
    // Verify authenticated session
    const session = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)
    if (!session || !session.webshopUserId) {
      console.warn('[deleteAccount] Unauthorized deletion attempt: no valid session')
      return res.status(401).json({ ok: false, message: 'Not authenticated' })
    }

    const webshopUserId = session.webshopUserId
    console.log(`[deleteAccount] Starting deletion for webshopUserId: ${webshopUserId}`)

    // Get Salesforce session
    const sf = await ensureSalesforceSession(req, res)

    // Delete Webshop_User__c record
    const deleteUrl = `/services/data/v60.0/sobjects/Webshop_User__c/${webshopUserId}`
    await callSalesforceApi(sf, deleteUrl, {
      method: 'DELETE'
    })
    console.log(`[deleteAccount] Webshop_User__c record deleted successfully: ${webshopUserId}`)

    // Clear session cookies
    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.VERIFIED_USER)
    console.log(`[deleteAccount] Session cookies cleared for webshopUserId: ${webshopUserId}`)

    return res.status(200).json({ ok: true, message: 'Account deleted' })
  } catch (err) {
    console.warn(`[deleteAccount] Error during account deletion:`, err?.message || err)
    return res.status(500).json({ ok: false, message: err?.message || 'Deletion failed' })
  }
}
