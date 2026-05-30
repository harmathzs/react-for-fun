import crypto from 'crypto'
import {
  parseCookies,
  encodeEncryptedCookie,
  decodeEncryptedCookie,
  setCookie,
  clearCookie
} from './cookies.js'

export const COOKIE_KEYS = {
  SITE_SESSION: 'wf_site_session',
  VERIFIED_USER: 'wf_verified_user',
  PENDING_REGISTRATION: 'wf_pending_registration',
  SALESFORCE_SESSION: 'wf_salesforce_session'
}

export function onlyMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '))
    res.status(405).json({ error: 'Method Not Allowed' })
    return false
  }

  return true
}

export function readJsonBody(req) {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body
  }

  if (!req.body || typeof req.body !== 'string') {
    return {}
  }

  try {
    return JSON.parse(req.body)
  } catch {
    return {}
  }
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function createShortCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function getCookieObject(req, key) {
  const cookies = parseCookies(req)
  const raw = cookies[key]
  if (!raw) return null
  return decodeEncryptedCookie(raw)
}

export function setCookieObject(res, key, payload, maxAgeSeconds) {
  const encoded = encodeEncryptedCookie(payload)
  setCookie(res, key, encoded, { maxAge: maxAgeSeconds })
}

export function clearCookieObject(res, key) {
  clearCookie(res, key)
}

export function responseOk(res, data = {}) {
  res.status(200).json({ ok: true, ...data })
}

export function responseError(res, code, message) {
  res.status(code).json({ ok: false, error: message })
}