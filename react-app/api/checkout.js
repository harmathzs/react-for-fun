import { ensureSalesforceSession, callSalesforceApi } from './_lib/salesforce.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  try {
    // ensure we have a server-side Salesforce session
    const sf = await ensureSalesforceSession(req, res)

    const body = await new Promise((resolve, reject) => {
      let data = ''
      req.on('data', chunk => data += chunk)
      req.on('end', () => resolve(data))
      req.on('error', reject)
    })

    const payload = body ? JSON.parse(body) : {}

    // forward to Apex REST endpoint that accepts the CheckoutRequest payload
    const apexResponse = await callSalesforceApi(sf, '/services/apexrest/webshop/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    return res.status(200).json({ ok: true, apex: apexResponse })
  } catch (err) {
    console.error('checkout error', err?.message || err)
    return res.status(500).json({ ok: false, message: err?.message || String(err) })
  }
}
