import { COOKIE_KEYS, getCookieObject, setCookieObject } from './auth-utils.js'

const TOKEN_REFRESH_BUFFER_SECONDS = 120
const SALESFORCE_COOKIE_TTL_SECONDS = 60 * 60

function readEnv(name) {
  return globalThis?.process?.env?.[name]
}

function getRequiredEnv(name) {
  const value = readEnv(name)
  if (!value) {
    console.warn('[salesforce] missing environment variable', { name })
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export function getSalesforceSession(req) {
  return getCookieObject(req, COOKIE_KEYS.SALESFORCE_SESSION)
}

function isTokenActive(session) {
  if (!session?.accessToken || !session?.instanceUrl || !session?.expiresAt) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return session.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS > now
}

export async function fetchSalesforceToken() {
  // This flow uses client credentials and runs only on the server side.
  const loginUrl = readEnv('SALESFORCE_LOGIN_URL') || 'https://login.salesforce.com'
  const consumerKey = getRequiredEnv('SALESFORCE_CONSUMER_KEY')
  const consumerSecret = getRequiredEnv('SALESFORCE_CONSUMER_SECRET')

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: consumerKey,
    client_secret: consumerSecret
  })

  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  const payload = await response.json()

  if (!response.ok) {
    console.warn('[salesforce] token exchange failed', {
      status: response.status,
      loginUrl,
      error: payload.error || null,
      description: payload.error_description || null
    })
    throw new Error(payload.error_description || payload.error || `Salesforce authentication failed (${response.status})`)
  }

  const expiresIn = Number(payload.expires_in || 3600)
  return {
    accessToken: payload.access_token,
    instanceUrl: payload.instance_url,
    tokenType: payload.token_type || 'Bearer',
    issuedAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + expiresIn
  }
}

export async function ensureSalesforceSession(req, res) {
  const existing = getSalesforceSession(req)

  // Reuse valid cookie-backed token so most requests skip re-authentication.
  if (isTokenActive(existing)) {
    return existing
  }

  const token = await fetchSalesforceToken()

  // Store token details in an encrypted HttpOnly cookie for cookie-only sharing.
  setCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION, token, SALESFORCE_COOKIE_TTL_SECONDS)

  return token
}

export async function callSalesforceApi(session, path, options = {}) {
  const response = await fetch(`${session.instanceUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `${session.tokenType} ${session.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    console.warn('[salesforce] api request failed', {
      status: response.status,
      path,
      method: options.method || 'GET',
      message: data[0]?.message || data.message || null,
      errorCode: data[0]?.errorCode || null
    })
    throw new Error(data[0]?.message || data.message || `Salesforce API call failed (${response.status})`)
  }

  return data
}

export function getSalesforceApiVersion() {
  return readEnv('SALESFORCE_API_VERSION') || 'v61.0'
}

export function escapeSoql(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export async function querySalesforce(session, soql) {
  const encoded = encodeURIComponent(soql)
  const version = getSalesforceApiVersion()
  const data = await callSalesforceApi(session, `/services/data/${version}/query?q=${encoded}`)
  return data.records || []
}

export async function createSalesforceRecord(session, objectApiName, payload) {
  const version = getSalesforceApiVersion()
  return callSalesforceApi(session, `/services/data/${version}/sobjects/${objectApiName}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function updateSalesforceRecord(session, objectApiName, recordId, payload) {
  const version = getSalesforceApiVersion()
  return callSalesforceApi(session, `/services/data/${version}/sobjects/${objectApiName}/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

export async function sendVerificationEmailViaApex(session, payload) {
  const data = await callSalesforceApi(session, '/services/apexrest/webshop/verification-email', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  if (!data?.ok) {
    throw new Error(data?.message || 'Verification email API returned failure')
  }

  return data
}