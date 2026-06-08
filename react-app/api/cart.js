import fs from 'fs'
import path from 'path'

const STORE = path.resolve(process.cwd(), 'react-app', '.cart-store.json')

function readStore() {
  try {
    const raw = fs.readFileSync(STORE, 'utf8')
    return JSON.parse(raw || '{}')
  } catch (e) {
    return {}
  }
}

function writeStore(obj) {
  try {
    fs.writeFileSync(STORE, JSON.stringify(obj, null, 2), 'utf8')
  } catch (e) {
    // swallow
  }
}

export default async function handler(req, res) {
  const method = req.method
  // use session cookie to key per-user cart
  const cookie = req.headers.cookie || ''
  // naive parse wf_site_session
  const m = cookie.match(/wf_site_session=([^;]+)/)
  const sessionId = m ? m[1] : 'anon'

  const store = readStore()
  store[sessionId] = store[sessionId] || { items: [] }

  if (method === 'GET') {
    return res.status(200).json({ ok: true, items: store[sessionId].items })
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = ''
        req.on('data', chunk => data += chunk)
        req.on('end', () => resolve(data))
        req.on('error', reject)
      })
      const payload = body ? JSON.parse(body) : {}
      store[sessionId].items = Array.isArray(payload.items) ? payload.items : payload.items || store[sessionId].items
      writeStore(store)
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(400).json({ ok: false, message: 'invalid payload' })
    }
  }

  if (method === 'PATCH') {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = ''
        req.on('data', chunk => data += chunk)
        req.on('end', () => resolve(data))
        req.on('error', reject)
      })
      const payload = body ? JSON.parse(body) : {}
      // payload: { productId, qty }
      if (payload.productId) {
        store[sessionId].items = (store[sessionId].items || []).map(i => i.product.id === payload.productId ? { ...i, qty: payload.qty } : i).filter(i=>i.qty>0)
        writeStore(store)
        return res.status(200).json({ ok: true })
      }
    } catch (e) {}
    return res.status(400).json({ ok: false })
  }

  if (method === 'DELETE') {
    // clear cart
    store[sessionId].items = []
    writeStore(store)
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE')
  return res.status(405).end()
}
