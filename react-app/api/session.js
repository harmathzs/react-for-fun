import {
  COOKIE_KEYS,
  getCookieObject,
  onlyMethods,
  responseOk
} from './_lib/auth-utils.js'

export default function handler(req, res) {
  if (!onlyMethods(req, res, ['GET'])) return

  const session = getCookieObject(req, COOKIE_KEYS.SITE_SESSION)

  return responseOk(res, {
    authenticated: !!session,
    user: session
      ? {
          webshopUserId: session.webshopUserId || null,
          email: session.email || null,
          username: session.username || null,
          firstName: session.firstName || null,
          lastName: session.lastName || null,
          company: session.company || null,
          loginAt: session.loginAt || null,
          expiresAt: session.expiresAt || null
        }
      : null
  })
}