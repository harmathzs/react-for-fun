import { ensureSalesforceSession, querySalesforce } from './_lib/salesforce.js'

export default async function handler(req, res) {
  try {
    const session = await ensureSalesforceSession(req, res)

    const soql = `SELECT Id, Name, ProductCode, Family, Description, IsActive, (SELECT Id, UnitPrice, Pricebook2Id, IsActive FROM PricebookEntries WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 1) FROM Product2 WHERE IsActive = true ORDER BY Name LIMIT 500`

    const records = await querySalesforce(session, soql)

    const products = records.map((r) => ({
      id: r.Id,
      name: r.Name,
      code: r.ProductCode,
      family: r.Family,
      description: r.Description,
      pricebookEntry: (r.PricebookEntries && r.PricebookEntries.length) ? {
        id: r.PricebookEntries[0].Id,
        unitPrice: r.PricebookEntries[0].UnitPrice,
        pricebookId: r.PricebookEntries[0].Pricebook2Id
      } : null
    }))

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify({ ok: true, products }))
  } catch (err) {
    console.error('[api/products] error', err)
    res.status(500).send(JSON.stringify({ ok: false, error: err.message }))
  }
}
