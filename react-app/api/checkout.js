import { COOKIE_KEYS, getCookieObject, onlyMethods, responseError, responseOk } from './_lib/auth-utils.js'
import { ensureSalesforceSession, callSalesforceApi, querySalesforce, updateSalesforceRecord } from './_lib/salesforce.js'

export default async function handler(req, res) {
  if (!onlyMethods(req, res, ['POST'])) return

  const traceId = `chk_${Date.now()}_${Math.floor(Math.random() * 100000)}`

  try {
    // Parse request body
    const body = await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', chunk => data += chunk)
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })

    const payload = body ? JSON.parse(body) : {}

    console.log('[checkout] request parsed', {
      traceId,
      externalOrderId: payload.externalOrderId,
      hasLeadId: !!payload.leadId,
      hasWebshopUserId: !!payload.webshopUserId,
      productCount: payload.orderProducts?.length || 0
    })

    // Ensure we have a Salesforce session
    let sf
    try {
      sf = await ensureSalesforceSession(req, res)
    } catch (error) {
      console.warn('[checkout] salesforce session failed', {
        traceId,
        message: error.message
      })
      return responseError(res, 502, 'Salesforce authentication failed', {
        traceId,
        reason: error.message
      })
    }

    // Extract session and resolve leadId if needed
    const session = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)
    let leadId = payload.leadId
    let webshopUserId = payload.webshopUserId || session?.webshopUserId

    // If we have webshopUserId but no leadId, resolve it from Webshop_User__c.Lead__c
    if (webshopUserId && !leadId) {
      try {
        console.log('[checkout] resolving leadId from webshopUserId', {
          traceId,
          webshopUserId
        })

        const rows = await querySalesforce(
          sf,
          `SELECT Lead__c FROM Webshop_User__c WHERE Id = '${webshopUserId}' LIMIT 1`
        )

        if (rows && rows[0] && rows[0].Lead__c) {
          leadId = rows[0].Lead__c
          console.log('[checkout] leadId resolved from webshopUserId', {
            traceId,
            webshopUserId,
            leadId
          })
        }
      } catch (error) {
        console.warn('[checkout] leadId resolution failed', {
          traceId,
          webshopUserId,
          message: error.message
        })
      }
    }

    // Validate that we have at least leadId or webshopUserId
    if (!leadId && !webshopUserId) {
      console.warn('[checkout] missing leadId or webshopUserId', {
        traceId
      })
      return responseError(res, 400, 'leadId or webshopUserId required for checkout', {
        traceId
      })
    }

    // Enrich payload with resolved values
    const enrichedPayload = {
      ...payload,
      traceId,
      ...(leadId ? { leadId } : {}),
      ...(webshopUserId ? { webshopUserId } : {})
    }

    console.log('[checkout] calling apex endpoint', {
      traceId,
      leadId: enrichedPayload.leadId,
      webshopUserId: enrichedPayload.webshopUserId,
      externalOrderId: enrichedPayload.externalOrderId
    })

    // Forward to Apex REST endpoint
    const apexResponse = await callSalesforceApi(sf, '/services/apexrest/webshop/checkout', {
      method: 'POST',
      body: JSON.stringify(enrichedPayload)
    })

    // Check Apex response
    if (apexResponse && apexResponse.ok === false) {
      console.warn('[checkout] apex returned business error', {
        traceId,
        message: apexResponse.message
      })
      return responseError(res, 400, apexResponse.message, {
        traceId,
        apexError: apexResponse.message
      })
    }

    // Update Webshop_User__c with conversion results (non-fatal if fails)
    if (webshopUserId && apexResponse) {
      try {
        await updateSalesforceRecord(sf, 'Webshop_User__c', webshopUserId, {
          Contact__c: apexResponse.contactId || null,
          Account__c: apexResponse.accountId || null,
          Opportunity__c: apexResponse.opportunityId || null,
          Converted__c: true
        })
        console.log('[checkout] webshop user updated with conversion results', {
          traceId,
          webshopUserId,
          contactId: apexResponse.contactId,
          accountId: apexResponse.accountId,
          opportunityId: apexResponse.opportunityId
        })
      } catch (error) {
        console.warn('[checkout] failed to update webshop user conversion fields', {
          traceId,
          webshopUserId,
          message: error.message
        })
        // non-fatal: continue with response
      }
    }

    console.log('[checkout] success', {
      traceId,
      orderId: apexResponse?.orderId,
      accountId: apexResponse?.accountId,
      contactId: apexResponse?.contactId,
      opportunityId: apexResponse?.opportunityId
    })

    return responseOk(res, {
      ok: true,
      message: apexResponse?.message || 'Checkout processed',
      orderId: apexResponse?.orderId,
      accountId: apexResponse?.accountId,
      contactId: apexResponse?.contactId,
      opportunityId: apexResponse?.opportunityId,
      createdIds: apexResponse?.createdIds
    })
  } catch (err) {
    console.warn('[checkout] unexpected error', {
      traceId,
      message: err?.message || String(err)
    })
    return responseError(res, 500, err?.message || 'Checkout failed', {
      traceId,
      reason: err?.message || String(err)
    })
  }
}
