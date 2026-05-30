import crypto from 'crypto'

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function getCookieSecret() {
  const rawSecret = process.env.APP_COOKIE_SECRET

  if (!rawSecret || rawSecret.length < 16) {
    throw new Error('Missing or weak APP_COOKIE_SECRET environment variable')
  }

  return crypto.createHash('sha256').update(rawSecret).digest()
}

function toBase64Url(buffer) {
  return buffer.toString('base64url')
}

function fromBase64Url(input) {
  return Buffer.from(input, 'base64url')
}

export function parseCookies(req) {
  const header = req.headers.cookie || ''
  const parsed = {}

  if (!header) {
    return parsed
  }

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (!name) continue
    parsed[name] = decodeURIComponent(rest.join('='))
  }

  return parsed
}

export function setCookie(res, name, value, options = {}) {
  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax',
    path = '/',
    maxAge = DEFAULT_MAX_AGE_SECONDS
  } = options

  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`
  ]

  if (httpOnly) attrs.push('HttpOnly')
  if (secure) attrs.push('Secure')

  const nextCookie = attrs.join('; ')
  const previous = res.getHeader('Set-Cookie')

  if (!previous) {
    res.setHeader('Set-Cookie', nextCookie)
    return
  }

  const list = Array.isArray(previous) ? previous : [previous]
  res.setHeader('Set-Cookie', [...list, nextCookie])
}

export function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0 })
}

export function encodeEncryptedCookie(payload) {
  const key = getCookieSecret()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${toBase64Url(iv)}.${toBase64Url(tag)}.${toBase64Url(encrypted)}`
}

export function decodeEncryptedCookie(value) {
  try {
    const [ivPart, tagPart, encryptedPart] = value.split('.')
    if (!ivPart || !tagPart || !encryptedPart) return null

    const key = getCookieSecret()
    const iv = fromBase64Url(ivPart)
    const tag = fromBase64Url(tagPart)
    const encrypted = fromBase64Url(encryptedPart)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return JSON.parse(decrypted.toString('utf8'))
  } catch {
    return null
  }
}