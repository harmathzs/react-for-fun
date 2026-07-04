# React 4 fun — Site Documentation

## Overview

**React 4 fun** is a React SPA built with Vite and deployed on Vercel. It started as a Salesforce Web-to-Lead capture form and has grown into a full-stack authenticated webshop. Users can register, verify their email, log in, browse products, place orders, view order history, manage account data, and read static info/help pages. All user data is stored in Salesforce custom objects. Session state is managed via AES-256-GCM encrypted HttpOnly cookies - no database or Redis required.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Bundler | Vite 4 |
| Routing | react-router-dom v6 |
| Styling | Plain CSS (`index.css`, `App.css`) |
| Hosting | Vercel (SPA + serverless API functions) |
| API runtime | Node.js ESM (`"type": "module"`) |
| CRM | Salesforce — custom objects + OAuth2 Client Credentials |
| Session storage | AES-256-GCM encrypted HttpOnly cookies |

---

## Project Structure

```
react-app/
├── index.html               # App shell, title: "React 4 fun"
├── vercel.json              # SPA rewrite + API function routing
├── api/                     # Vercel serverless functions (Node.js ESM)
│   ├── session.js           # GET  — reads SITE_SESSION cookie, returns auth state
│   ├── register.js          # POST — register new user, create Webshop_User__c
│   ├── verify.js            # POST — verify email code, activate user, include webshopUserId in session
│   ├── login.js             # POST — authenticate, create Webshop_Session__c
│   ├── logout.js            # POST — revoke session, clear cookies
│   ├── deleteAccount.js     # DELETE — permanently delete user's Webshop_User__c and clear all cookies
│   ├── checkout.js          # POST — convert Lead to Account/Contact/Opportunity, create Order/OrderItems
│   ├── orders.js            # GET  — fetch authenticated user's orders with product details
│   ├── salesforce-auth.js   # GET/POST/DELETE — Salesforce session management
│   └── _lib/
│       ├── auth-utils.js    # COOKIE_KEYS, hashPassword, createShortCode, response helpers
│       ├── cookies.js       # AES-256-GCM encrypt/decrypt, parse/set/clear cookies
│       └── salesforce.js    # fetchSalesforceToken, ensureSalesforceSession, SOQL/REST/Apex helpers
├── src/
│   ├── main.jsx             # Entry point, mounts BrowserRouter + App
│   ├── App.jsx              # Root layout: session state, route guards, Navbar, Footer
│   ├── App.css              # All component and page styles
│   ├── index.css            # Global reset and base styles (light theme)
│   ├── components/
│   │   ├── Navbar.jsx       # Auth-aware sticky navigation with profile dropdown
│   │   └── Footer.jsx       # Footer with links to info pages and account
│   └── pages/
│       ├── InterestPage.jsx # / — Web-to-Lead form (unauthenticated landing)
│       ├── ThanksPage.jsx   # /thanks — Post-lead-submission confirmation
│       ├── RegisterPage.jsx # /register — Registration + email verification flow
│       ├── LoginPage.jsx    # /login — Login form
│       ├── ShopPage.jsx     # /shop — Authenticated shop
│       ├── ProductsPage.jsx # /products — Product catalog (searchable)
│       ├── CartPage.jsx     # /cart — Shopping cart
│       ├── AccountPage.jsx  # /account — User profile & account deletion
│       ├── OrdersPage.jsx   # /orders — Order history with expandable accordion UI
│       ├── AboutPage.jsx    # /about-us — Company info
│       ├── CareersPage.jsx  # /careers — No open positions
│       ├── OrderStatusPage.jsx  # /order-status — How to check order status
│       ├── ShippingPage.jsx # /shipping — Shipping methods & delivery info
│       ├── FAQPage.jsx      # /faq — Expandable Q&A
│       ├── ContactPage.jsx  # /contact-us — Contact form + direct info
│       └── AccessibilityPage.jsx # /accessibility — WCAG compliance info
```

---

## Application Shell (`main.jsx` → `App.jsx`)

`main.jsx` wraps the entire tree in `<BrowserRouter>` and mounts it to `#root`.

`App.jsx` fetches `/api/session` on mount to determine auth state. While loading it shows a spinner card. Once resolved it renders route guards:

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar (sticky, auth-aware)                                 │
├──────────────────────────────────────────────────────────────┤
│  <main>                                                      │
│    /                → InterestPage (unauthed) | → /shop      │
│    /shop           → ShopPage (authed)       | → /           │
│    /login          → LoginPage               | → /shop       │
│    /register       → RegisterPage            | → /shop       │
│    /thanks         → ThanksPage                              │
│    /products       → ProductsPage (all users)                │
│    /cart           → CartPage (all users)                    │
│    /account        → AccountPage (authed)    | → /login      │
│    /orders         → OrdersPage (authed)     | → /login      │
│    /about-us       → AboutPage (all users)                   │
│    /careers        → CareersPage (all users)                 │
│    /order-status   → OrderStatusPage (all users)             │
│    /shipping       → ShippingPage (all users)                │
│    /faq            → FAQPage (all users)                     │
│    /contact-us     → ContactPage (all users)                 │
│    /accessibility  → AccessibilityPage (all users)           │
│  </main>                                                     │
├──────────────────────────────────────────────────────────────┤
│  Footer (links to info pages + account links)                │
└──────────────────────────────────────────────────────────────┘
```

Session state (`loading`, `authenticated`, `user`) lives in `App.jsx`. `loadSession()` re-fetches `/api/session` after login, register/verify, or logout. `handleLogout()` calls `POST /api/logout`, then `loadSession()`, then navigates to `/`.

---

## Components

### `Navbar` (`src/components/Navbar.jsx`)

Sticky top bar, always visible. Layout: CSS Grid `auto auto 1fr auto` (home icon, brand, nav links, profile area).

- **Home icon + brand link** → `/shop` when authenticated, `/` otherwise
- **Nav links** — context-aware:
  - Unauthenticated: *Interest in Products*; *Login* link only while on `/login`; *Register* link only while on `/register`
  - Authenticated: *Shop*
- **Profile area** — username pill + avatar button opens a dropdown:
  - Unauthenticated: Login / Register links
  - Authenticated: Logout button
- `displayName`: `user.firstName` → `user.username` → `user.email` → `'Guest User'`
- Dropdown dismisses on outside click or Escape key

---

## Pages

### Interest Page (`src/pages/InterestPage.jsx`) — route `/`

Unauthenticated landing page. Contains the Salesforce Web-to-Lead form. Redirects to `/shop` if the user is already authenticated.

#### Form behaviour

- Submits via native HTTP `POST` directly to Salesforce:
  ```
  https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DdM00000vOexx
  ```
- On successful submission Salesforce redirects the browser to `/thanks` (set via the hidden `retURL` field).
- No JavaScript fetch or AJAX is involved; the browser navigates away on submit.

---

### Thanks Page (`src/pages/ThanksPage.jsx`) — route `/thanks`

Confirmation page shown after the Web-to-Lead form is submitted. Salesforce redirects here via the `retURL` hidden field.

- Green circular checkmark icon, *Thank you!* heading, confirmation message
- **Back to Home** button (React Router `<Link>` to `/`)

### Register Page (`src/pages/RegisterPage.jsx`) — route `/register`

Two-step registration form. Redirects to `/shop` if already authenticated.

**Step 1 — Registration:** collects email, password (≥8 chars), first name, last name, company. On success the API sends a verification email through Salesforce Apex and returns a `serverCode` only in non-production for local testing.

**Step 2 — Verification:** user enters the 6-digit code. On success calls `onAuthChange()` (re-fetches session) and navigates to `/shop`.

### Login Page (`src/pages/LoginPage.jsx`) — route `/login`

Email + password form. Redirects to `/shop` if already authenticated. On success calls `onAuthChange()` and navigates to `/shop`.

### Shop Page (`src/pages/ShopPage.jsx`) — route `/shop`

Authenticated-only route. Redirects to `/` if not authenticated. Product listing and shopping interface.

### Products Page (`src/pages/ProductsPage.jsx`) — route `/products`

Product catalog accessible to all users. Supports search filtering via query params (`?q=searchterm`).

### Cart Page (`src/pages/CartPage.jsx`) — route `/cart`

Shopping cart for purchases. Checkout triggers Lead-to-Account conversion and Order creation.

### Account Page (`src/pages/AccountPage.jsx`) — route `/account`

Authenticated-only route. Displays user profile information and provides account deletion capability.

### Orders Page (`src/pages/OrdersPage.jsx`) — route `/orders`

Authenticated-only route. Displays user's order history in expandable accordion UI. Each accordion shows:
- Order number, date, time, status (color-coded: Green=Activated, Blue=Draft, Red=Cancelled)
- Expandable details: order ID, external ID, status, products table (Name, Qty, Unit Price, Subtotal), order total
- Empty state for users with no orders yet

### Static Information Pages

#### About Page (`src/pages/AboutPage.jsx`) — route `/about-us`

Company mission, values, and philosophy.

#### Careers Page (`src/pages/CareersPage.jsx`) — route `/careers`

Currently no open positions, but invites future applicants to introduce themselves.

#### Order Status Page (`src/pages/OrderStatusPage.jsx`) — route `/order-status`

Guides users on how to check order status in their account. Explains status types (Draft, Activated, Cancelled).

#### Shipping Page (`src/pages/ShippingPage.jsx`) — route `/shipping`

Shipping methods (Standard, Express, Local Pickup) with delivery times and costs. International shipping info.

#### FAQ Page (`src/pages/FAQPage.jsx`) — route `/faq`

Expandable accordion with 8 common Q&A pairs covering refunds, account creation, order changes, payments, delivery, data safety, loyalty, and promo codes.

#### Contact Page (`src/pages/ContactPage.jsx`) — route `/contact-us`

Contact form with name, email, subject, message fields. Displays direct contact info (email, phone, address).

#### Accessibility Page (`src/pages/AccessibilityPage.jsx`) — route `/accessibility`

WCAG 2.1 Level AA compliance information. Lists keyboard navigation, screen reader support, contrast standards, zoom support, and accessibility features.

---

## Salesforce Integration

### Web-to-Lead (InterestPage)

The lead capture form posts directly to the Salesforce Web-to-Lead endpoint. Hidden fields set `oid`, `lead_source=Web`, and `retURL`. The visible `Product Interest` field posts to the `description` field (multi-select picklist fields are unsupported by Web-to-Lead); a record-triggered Flow on Lead create copies `Description` into the real `Product Interest` field.

Custom Salesforce fields must use the `00N...` field ID (not the API name) in the HTML `name` attribute.

### Authentication Backend (OAuth2 Client Credentials)

All serverless API functions authenticate with Salesforce using the **OAuth2 Client Credentials** (machine-to-machine) flow against the `Custom_Webshop_External_Client_App` Connected App. No user is redirected to Salesforce — this flow runs entirely server-side.

The access token is cached in an encrypted `SALESFORCE_SESSION` HttpOnly cookie and reused across requests until it expires (with a 120-second refresh buffer). `ensureSalesforceSession(req, res)` is called at the top of every handler that needs Salesforce access.

**Salesforce environment:**
- My Domain: `https://salesforfun-dev-ed.develop.my.salesforce.com`
- API version: `v61.0`
- Run As user: a Salesforce-licensed user (Identity license cannot hold object CRUD permissions)
- Permission Set `Webshop Integration Access` assigned to the Run As user
- Custom objects must be **Deployed** (not In Development) for the permission set to surface them

### Custom Objects

**`Webshop_User__c`** — one record per registered user
- Fields: `Email__c`, `Username__c`, `First_Name__c`, `Last_Name__c`, `Company__c`, `Password_Hash__c` (SHA-256), `Status__c` (restricted picklist: `Pending_Verification`, `Active`), `Email_Verified__c`, `Email_Verified_At__c`, `Failed_Login_Count__c`, `Last_Login_At__c`
- Optional lookup fields: `Lead__c`, `Contact__c`, `Account__c`, `Opportunity__c` - populated during registration and checkout to link converted CRM records

**`Webshop_Session__c`** — one record per login session
- Fields: `Session_Id__c`, `Issued_At__c`, `Expires_At__c`, `Last_Seen_At__c`, `Active__c`, `Revoked_At__c`

### API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/session` | GET | Read `SITE_SESSION` cookie; return `{ authenticated, user }` |
| `/api/register` | POST | Validate fields → Salesforce duplicate check → query existing Lead/Contact; reset lead verification only when lead is not converted → create `Webshop_User__c` → send verification email → set `PENDING_REGISTRATION` cookie |
| `/api/verify` | POST | Validate code from body against `PENDING_REGISTRATION` cookie → update `Webshop_User__c` to Active + set Email_Verified__c=true → optionally sync Lead verification fields (skips converted leads) → set `SITE_SESSION` + `VERIFIED_USER` cookies |
| `/api/login` | POST | Query `Webshop_User__c` → validate status + password hash → create `Webshop_Session__c` → set `SITE_SESSION` + `SALESFORCE_SESSION` cookies |
| `/api/logout` | POST | Set `Webshop_Session__c.Active__c = false`, `Revoked_At__c` → clear all session cookies |
| `/api/deleteAccount` | DELETE | Delete `Webshop_User__c` record → clear `SITE_SESSION`, `SALESFORCE_SESSION`, `VERIFIED_USER` cookies |
| `/api/checkout` | POST | Extract Lead ID from `Webshop_User__c.Lead__c` → call Apex `/services/apexrest/webshop/checkout` → atomically convert Lead to Account/Contact/Opportunity, create Order + OrderItems → update `Webshop_User__c` with conversion results (Contact__c, Account__c, Opportunity__c, Converted__c=true) |
| `/api/orders` | GET | Query `Webshop_User__c` from session → get Account__c → fetch all Orders → query OrderItems with nested Product2 data → return formatted order list with product names |
| `/api/salesforce-auth` | GET/POST/DELETE | Salesforce session status / connect / clear |

### Cookie Inventory

| Cookie | TTL | Contents |
|---|---|---|
| `SITE_SESSION` | 8 hours | `webshopUserId`, `email`, `firstName`, `lastName`, `company`, `loginAt`, `expiresAt` |
| `VERIFIED_USER` | 30 days | email of verified user (local duplicate-check shortcut) |
| `PENDING_REGISTRATION` | 30 minutes | `verificationCode` (hashed), `hashedPassword`, `webshopUserId`, `email`, `expiry` |
| `SALESFORCE_SESSION` | 1 hour | Salesforce `accessToken`, `instanceUrl`, `expiresAt` |

All cookies are AES-256-GCM encrypted, `HttpOnly`, `SameSite=Strict`.

### Environment Variables

| Variable | Purpose |
|---|---|
| `SALESFORCE_CONSUMER_KEY` | Connected App client ID |
| `SALESFORCE_CONSUMER_SECRET` | Connected App client secret |
| `SALESFORCE_LOGIN_URL` | `https://salesforfun-dev-ed.develop.my.salesforce.com` |
| `SALESFORCE_API_VERSION` | `v61.0` |
| `SALESFORCE_ORG_ID` | Org ID |
| `SALESFORCE_INTEGRATION_USER_ID` | Run As user ID |
| `APP_COOKIE_SECRET` | AES-256-GCM cookie encryption key |
| `NODE_ENV` | `production` on Vercel; non-production returns `verificationCode` in response body |

---

## Styling

All styles live in two files — no external UI library is used.

| File | Scope |
|---|---|
| `src/index.css` | Global reset, font, body background (light: `#f5f6fa`) |
| `src/App.css` | Layout, navbar, page card, form grid, buttons, footer, responsive breakpoints |

Key CSS classes:

| Class | Description |
|---|---|
| `.app-layout` | Full-height flex column for sticky footer |
| `.page-card` | White rounded card (`border-radius: 16px`) for page content |
| `.auth-card` | Narrower card variant used for login/register/verify forms |
| `.form-card` | Wider card variant for the Web-to-Lead form (max-width 860px) |
| `.form-grid` | 2-column CSS grid for form fields |
| `.name-row` | 3-column sub-grid (`0.8fr 1.2fr 1.2fr`) for Salutation/First/Last |
| `.field` | Flex column wrapper for label + input pairs |
| `.field-full` | Spans both columns (`grid-column: 1 / -1`) |
| `.btn-primary` | Blue rounded button (`#2563eb`) |
| `.navbar-inner` | CSS Grid `auto auto 1fr auto` — home icon, brand, links, profile |
| `.profile-dropdown` | Absolute-positioned dropdown from profile avatar button |
| `.username-pill` | Truncated display name chip in the navbar |

---

## Deployment (Vercel)

`vercel.json` contains a catch-all rewrite so Vercel serves `index.html` for all non-API paths, enabling React Router client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

API functions in `api/` are automatically served as Vercel serverless functions at `/api/*`.

Live URL: `https://react-for-fun.vercel.app`

---

## Recently Completed

| Feature | Status | Notes |
|---|---|---|
| Email sending for verification | ✅ | `/api/register` now sends verification emails through Apex REST `/services/apexrest/webshop/verification-email`; non-production still returns the code in the response body for local testing. |
| Account deletion | ✅ | `/api/deleteAccount` endpoint clears all cookies and permanently removes user record |
| Re-registration support | ✅ | Users can delete and re-register with same email; register.js now skips Lead patch on converted leads to avoid CANNOT_UPDATE_CONVERTED_LEAD |
| Lead conversion at checkout | ✅ | Apex WebshopCheckout atomically converts Lead to Account/Contact/Opportunity on first checkout |
| Repeat order support | ✅ | Apex checks if Lead already converted; reuses Account/Contact and creates new Opportunity for subsequent orders |
| Order history page | ✅ | Orders page with expandable accordion UI, status badges, product details with correct names |
| Static information pages | ✅ | About, Careers, Order Status, Shipping, FAQ, Contact, Accessibility pages fully implemented |
| Footer navigation | ✅ | All footer links connect to static pages and authenticated account routes |
| Session management in new registrations | ✅ | verify.js now includes webshopUserId in SITE_SESSION, enabling immediate account access |
| Converted lead safety in verify | ✅ | verify.js checks Lead.IsConverted and skips Lead update to prevent warning noise |

## Pending / Not Yet Implemented

| Feature | Notes |
|---|---|
| `Webshop_Session__c` cleanup | No Scheduled Flow/Apex job yet to expire old session records |
| ShopPage product display | Route and auth guard exist; product content not fully implemented |
| Inventory management | No inventory tracking on products yet |
| Order cancellation | Users cannot cancel orders after creation |
| Order refunds workflow | No refund process implemented |
| Payment processing | Orders created in draft; no actual payment gateway integration |
| Invoice download | Orders cannot be exported as PDF/invoice |
| Reorder button | No quick-reorder functionality from Orders page |

---

## Extending the Site

- **Add a nav link:** add a `<li><NavLink>` inside the `<ul>` in `Navbar.jsx`.
- **Add a page:** create `src/pages/NewPage.jsx`, add a `<Route>` in `App.jsx`, link it in `Navbar.jsx`.
- **Add a Salesforce custom Lead field (Web-to-Lead):** include the field in the Web-to-Lead form generator in Salesforce Setup, copy the `00N...` name from the generated HTML, and add a matching `<input>` in `InterestPage.jsx`.
- **Add a `Webshop_User__c` field:** add the field in Salesforce, deploy it, update the Permission Set, then update the SOQL in `login.js` and the session payload in `login.js` / `session.js`.
