import { ensureSalesforceSession, querySalesforce } from './_lib/salesforce.js'

export default async function handler(req, res) {
  try {
    const session = await ensureSalesforceSession(req, res)

    // Query the Standard Price Book and its PricebookEntries to reliably get prices
    const pbSoql = `SELECT CreatedDate, Name, (SELECT Id, UnitPrice, Product2Id, ProductCode, Product2.Name, Product2.StockKeepingUnit, Product2.Family, Product2.Description FROM PricebookEntries LIMIT 500) FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1`

    const pbRecords = await querySalesforce(session, pbSoql)

    const products = []
    if (pbRecords && pbRecords.length > 0) {
      // Salesforce returns subquery results under the nested `records` property.
      const pb = pbRecords[0]
      const entries = (pb.PricebookEntries && pb.PricebookEntries.records) || pb.PricebookEntries || []
      for (const e of entries) {
        const product2 = e.Product2 || {}
        products.push({
          id: product2.Id || e.Product2Id || e.Id,
          name: product2.Name || e.Product2Name || null,
          code: product2.StockKeepingUnit || e.ProductCode || null,
          family: product2.Family || null,
          description: product2.Description || null,
          pricebookEntry: {
            id: e.Id,
            unitPrice: e.UnitPrice,
            pricebookId: pb.Id
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
