import { ensureSalesforceSession, querySalesforce } from './_lib/salesforce.js'

export default async function handler(req, res) {
  try {
    const session = await ensureSalesforceSession(req, res)

    // Query the Standard Price Book and its PricebookEntries to reliably get prices
    const pbSoql = `SELECT CreatedDate, Name, (SELECT Id, UnitPrice, Product2Id, ProductCode, Product2.Name, Product2.StockKeepingUnit, Product2.Family, Product2.Description FROM PricebookEntries LIMIT 500) FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1`

    const pbRecords = await querySalesforce(session, pbSoql)

    const products = []
    if (pbRecords && pbRecords.length > 0) {
      const entries = pbRecords[0].PricebookEntries || []
      for (const e of entries) {
        products.push({
          id: e.Product2Id || e.Id,
          name: (e.Product2 && e.Product2.Name) || e.Product2Name || null,
          code: e.Product2 ? (e.Product2.StockKeepingUnit || e.ProductCode) : e.ProductCode,
          family: e.Product2 ? e.Product2.Family : null,
          description: e.Product2 ? e.Product2.Description : null,
          pricebookEntry: {
            id: e.Id,
            unitPrice: e.UnitPrice,
            pricebookId: pbRecords[0].Id
          }
        })
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify({ ok: true, products }))
  } catch (err) {
    console.error('[api/products] error', err)
    res.status(500).send(JSON.stringify({ ok: false, error: err.message }))
  }
}
