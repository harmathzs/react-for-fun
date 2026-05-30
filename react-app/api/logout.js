/* Endpoint: /api/logout */
import {
    COOKIE_KEYS,
    clearCookieObject,
    onlyMethods,
    responseOk
} from './_lib/auth-utils.js'

export default function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    // Clear all cookie-only auth/session artifacts.
    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.SALESFORCE_SESSION)
    clearCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION)

    return responseOk(res, { message: 'Logged out successfully' })
}