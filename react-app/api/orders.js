/* Endpoint: /api/orders */
import {
  COOKIE_KEYS,
  getCookieObject,
  onlyMethods,
  responseError,
  responseOk
} from './_lib/auth-utils.js'
import {
  ensureSalesforceSession,
  querySalesforce
} from './_lib/salesforce.js'

export default async function handler(req, res) {
  if (!onlyMethods(req, res, ['GET'])) return

  try {
    // Verify authenticated session
    const session = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)
    if (!session || !session.webshopUserId) {
      return responseError(res, 401, 'Not authenticated')
    }

    const webshopUserId = session.webshopUserId
    console.log('[orders] fetching orders for webshopUserId:', webshopUserId)

    // Get Salesforce session
    const sf = await ensureSalesforceSession(req, res)

    // Query Webshop_User__c to get Account__c
    const userRows = await querySalesforce(
      sf,
      `SELECT Account__c FROM Webshop_User__c WHERE Id = '${webshopUserId}' LIMIT 1`
    )

    if (!userRows || userRows.length === 0) {
      return responseError(res, 404, 'Webshop user not found')
    }

    const accountId = userRows[0].Account__c
    if (!accountId) {
      // User hasn't checked out yet, no orders
      return responseOk(res, { orders: [] })
    }

    // Query Orders for this Account with their OrderItems
    const orders = await querySalesforce(
      sf,
      `SELECT 
        Id, 
        OrderNumber, 
        Status, 
        EffectiveDate, 
        TotalAmount,
        External_Id__c,
        CreatedDate
      FROM Order 
      WHERE AccountId = '${accountId}' 
      ORDER BY CreatedDate DESC`
    )

    // For each order, fetch its OrderItems
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        try {
          const items = await querySalesforce(
            sf,
            `SELECT 
              Id,
              Product2Id,
              Product2.Name,
              Quantity,
              UnitPrice,
              ListPrice
            FROM OrderItem 
            WHERE OrderId = '${order.Id}'
            ORDER BY CreatedDate ASC`
          )

          const subtotal = (items || []).reduce(
            (sum, item) => sum + ((item.UnitPrice || 0) * (item.Quantity || 0)),
            0
          )

          return {
            ...order,
            items: items || [],
            subtotal,
            formattedDate: new Date(order.CreatedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            formattedTime: new Date(order.CreatedDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        } catch (error) {
          console.warn('[orders] failed to fetch items for order', order.Id, error?.message)
          return {
            ...order,
            items: [],
            subtotal: order.TotalAmount || 0,
            formattedDate: new Date(order.CreatedDate).toLocaleDateString(),
            formattedTime: new Date(order.CreatedDate).toLocaleTimeString()
          }
        }
      })
    )

    console.log('[orders] success', {
      webshopUserId,
      accountId,
      orderCount: ordersWithItems.length
    })

    return responseOk(res, { orders: ordersWithItems })
  } catch (err) {
    console.warn('[orders] error', err?.message || err)
    return responseError(res, 500, 'Failed to fetch orders', {
      reason: err?.message || String(err)
    })
  }
}
