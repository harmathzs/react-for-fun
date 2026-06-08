import {
  COOKIE_KEYS,
  getCookieObject,
  onlyMethods,
  responseOk
} from './_lib/auth-utils.js'
import { ensureSalesforceSession, querySalesforce } from './_lib/salesforce.js'

export default async function handler(req, res) {
  if (!onlyMethods(req, res, ['GET'])) return

  const session = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)
  if (!session) {
    return responseOk(res, { authenticated: false, user: null })
  }

  // augment session user with Lead id from Webshop_User__c if available
  const userPayload = {
    webshopUserId: session.webshopUserId || null,
    email: session.email || null,
    username: session.username || null,
    firstName: session.firstName || null,
    lastName: session.lastName || null,
    company: session.company || null,
    loginAt: session.loginAt || null,
    expiresAt: session.expiresAt || null
  }

  if (session.webshopUserId) {
    try {
      const sf = await ensureSalesforceSession(req, res)
      const rows = await querySalesforce(sf, `SELECT Id, Lead__c FROM Webshop_User__c WHERE Id = '${session.webshopUserId}' LIMIT 1`)
      const userRec = rows && rows[0]
      if (userRec && userRec.Lead__c) {
        userPayload.leadId = userRec.Lead__c
      }
    } catch (err) {
      // non-fatal: just log and continue without leadId
      console.warn('[session] could not fetch webshop user leadId', err && err.message ? err.message : err)
    }
  }

  return responseOk(res, { authenticated: true, user: userPayload })
}