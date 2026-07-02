/* Endpoint: /api/register */
import {
    COOKIE_KEYS,
    clearCookieObject,
    createShortCode,
    getCookieObject,
    hashPassword,
    onlyMethods,
    readJsonBody,
    responseError,
    responseOk,
    setCookieObject
} from './_lib/auth-utils.js'
import {
    createSalesforceRecord,
    ensureSalesforceSession,
    escapeSoql,
    querySalesforce,
    sendVerificationEmailViaApex,
    updateSalesforceRecord
} from './_lib/salesforce.js'

const PENDING_REGISTRATION_TTL_SECONDS = 60 * 30

export default async function handler(req, res) {
    if (!onlyMethods(req, res, ['POST'])) return

    const traceId = `reg_${Date.now()}_${Math.floor(Math.random() * 100000)}`

    // Parse the registration request body from Vercel runtime.
    const body = readJsonBody(req)
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const firstName = String(body.firstName || '').trim()
    const lastName = String(body.lastName || '').trim()
    const company = String(body.company || '').trim()

    // Validate mandatory fields for basic registration quality.
    if (!email || !password || !firstName || !lastName || !company) {
        return responseError(res, 400, 'Missing required registration fields')
    }

    if (password.length < 8) {
        return responseError(res, 400, 'Password must be at least 8 characters long')
    }

    // Keep local cookie duplicate checks for this browser session.
    const existingCookieUser = getCookieObject(req, COOKIE_KEYS.VERIFIED_USER)
    if (existingCookieUser?.email === email) {
        return responseError(res, 409, 'User already exists, please login')
    }

    // Log lightweight registration context to match Vercel log lines with frontend failures.
    console.log('[register] start', {
        traceId,
        emailDomain: email.includes('@') ? email.split('@')[1] : null,
        hasUsername: !!body.username
    })

    // Create Salesforce session first because register now writes real Webshop_User records.
    let sf
    try {
        sf = await ensureSalesforceSession(req, res)
    } catch (error) {
        console.warn('[register] salesforce session failed', {
            traceId,
            message: error.message
        })
        return responseError(res, 502, 'Salesforce authentication failed', {
            traceId,
            reason: error.message
        })
    }

    // Search existing webshop users by email to avoid duplicate registrations.
    let existingUsers = []
    try {
        existingUsers = await querySalesforce(
            sf,
            `SELECT Id, Email__c FROM Webshop_User__c WHERE Email__c = '${escapeSoql(email)}' LIMIT 1`
        )
    } catch (error) {
        console.warn('[register] user lookup failed', {
            traceId,
            message: error.message
        })
        return responseError(res, 502, 'Salesforce user lookup failed', {
            traceId,
            reason: error.message
        })
    }

    if (existingUsers.length > 0) {
        return responseError(res, 409, 'User already exists, please login')
    }

    // Resolve related CRM entities by email. Prefer existing records before creating a new lead.
    let leadId
    let contactId
    let accountId
    let opportunityId
    try {
        const existingLeads = await querySalesforce(
            sf,
            `SELECT Id, IsConverted, ConvertedContactId, ConvertedAccountId, ConvertedOpportunityId, Email_Verified__c, Email_Verified_At__c FROM Lead WHERE Email = '${escapeSoql(email)}' ORDER BY CreatedDate DESC LIMIT 1`
        )

        if (existingLeads.length > 0) {
            const lead = existingLeads[0]
            leadId = lead.Id
            contactId = lead.ConvertedContactId || null
            accountId = lead.ConvertedAccountId || null
            opportunityId = lead.ConvertedOpportunityId || null

            // If lead was previously verified (e.g., from a deleted account re-registering),
            // reset verification status for a fresh verification email.
            if (lead.Email_Verified__c === true) {
                await updateSalesforceRecord(sf, 'Lead', leadId, {
                    Email_Verified__c: false,
                    Email_Verified_At__c: null
                })
                console.log('[register] lead verification reset', {
                    traceId,
                    leadId
                })
            }
        }

        const existingContacts = await querySalesforce(
            sf,
            `SELECT Id, AccountId FROM Contact WHERE Email = '${escapeSoql(email)}' ORDER BY CreatedDate DESC LIMIT 1`
        )

        if (existingContacts.length > 0) {
            contactId = existingContacts[0].Id
            accountId = existingContacts[0].AccountId || accountId
        }

        if (!leadId && !contactId) {
            const createdLead = await createSalesforceRecord(sf, 'Lead', {
                FirstName: firstName,
                LastName: lastName,
                Company: company,
                Email: email
            })
            leadId = createdLead.id
        }
    } catch (error) {
        console.warn('[register] lead/contact resolve failed', {
            traceId,
            message: error.message
        })
        return responseError(res, 502, 'Salesforce lead/contact resolution failed', {
            traceId,
            reason: error.message
        })
    }

    // Create a short verification code and store a pending registration cookie.
    const verificationCode = createShortCode()
    const pendingRegistration = {
        email,
        firstName,
        lastName,
        company,
        leadId: leadId || null,
        username: String(body.username || email).trim().toLowerCase(),
        passwordHash: hashPassword(password),
        verificationCode,
        expiresAt: Math.floor(Date.now() / 1000) + PENDING_REGISTRATION_TTL_SECONDS
    }

    // Send verification code through Apex so production does not depend on response body codes.
    try {
        let emailSendResult = await sendVerificationEmailViaApex(sf, {
            leadId: leadId || null,
            email,
            firstName,
            code: verificationCode,
            expiryMinutes: Math.floor(PENDING_REGISTRATION_TTL_SECONDS / 60)
        })
        console.log('emailSendResult: ', emailSendResult)
    } catch (error) {
        console.warn('[register] verification email send failed', {
            traceId,
            leadId: leadId || null,
            message: error.message
        })
        return responseError(res, 502, 'Failed to send verification email', {
            traceId,
            reason: error.message
        })
    }

    clearCookieObject(res, COOKIE_KEYS.SITE_SESSION)

    // Create the Webshop_User record in Salesforce with pending verification status.
    let created
    try {
        const webshopUserPayload = {
            ...(leadId ? { Lead__c: leadId } : {}),
            ...(contactId ? { Contact__c: contactId } : {}),
            ...(accountId ? { Account__c: accountId } : {}),
            ...(opportunityId ? { Opportunity__c: opportunityId } : {}),
            Email__c: email,
            First_Name__c: firstName,
            Last_Name__c: lastName,
            Company__c: company,
            Username__c: pendingRegistration.username,
            Password_Hash__c: pendingRegistration.passwordHash,
            Status__c: 'Pending_Verification',
            Email_Verified__c: false,
            Failed_Login_Count__c: 0,
            Salesforce_User__c: globalThis?.process?.env?.SALESFORCE_INTEGRATION_USER_ID || null
        }

        created = await createSalesforceRecord(sf, 'Webshop_User__c', {
            ...webshopUserPayload
        })
    } catch (error) {
        console.warn('[register] user create failed', {
            traceId,
            message: error.message
        })
        return responseError(res, 502, 'Salesforce user creation failed', {
            traceId,
            reason: error.message
        })
    }

    console.log('[register] success', {
        traceId,
        webshopUserId: created.id
    })

    pendingRegistration.webshopUserId = created.id
    setCookieObject(res, COOKIE_KEYS.PENDING_REGISTRATION, pendingRegistration, PENDING_REGISTRATION_TTL_SECONDS)

    // Return verification code only for local/dev testing until email sender is added.
    const includeCode = globalThis?.process?.env?.NODE_ENV !== 'production'

    return responseOk(res, {
        message: 'Registration started. Please verify your email before login.',
        webshopUserId: created.id,
        ...(includeCode ? { verificationCode } : {})
    })
}