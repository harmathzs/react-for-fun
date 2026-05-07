# React 4 fun — Site Documentation

## Overview

**React 4 fun** is a lightweight React single-page application (SPA) built with Vite and deployed on Vercel. Its primary purpose is to capture sales leads via a Salesforce Web-to-Lead form and redirect the user to a thank-you page after submission. The UI is light-themed with a business appearance, rounded components, and no third-party UI framework — only plain CSS.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Bundler | Vite 4 |
| Routing | react-router-dom v6 |
| Styling | Plain CSS (`index.css`, `App.css`) |
| Hosting | Vercel |
| CRM integration | Salesforce Web-to-Lead (HTTP POST) |

---

## Project Structure

```
react-app/
├── index.html               # App shell, title: "React 4 fun"
├── vercel.json              # SPA rewrite rule
├── src/
│   ├── main.jsx             # Entry point, mounts BrowserRouter + App
│   ├── App.jsx              # Root layout: Navbar + Routes + Footer
│   ├── App.css              # All component and page styles
│   ├── index.css            # Global reset and base styles (light theme)
│   ├── components/
│   │   └── Navbar.jsx       # Sticky top navigation
│   └── pages/
│       ├── InterestPage.jsx # / — Web-to-Lead form page
│       └── ThanksPage.jsx   # /thanks — Post-submission confirmation page
```

---

## Application Shell (`main.jsx` → `App.jsx`)

`main.jsx` wraps the entire tree in `<BrowserRouter>` and mounts it to `#root`.

`App.jsx` provides the persistent page shell:

```
┌──────────────────────────────┐
│  Navbar (sticky)             │
├──────────────────────────────┤
│  <main>                      │
│    Route: /       → InterestPage  │
│    Route: /thanks → ThanksPage    │
│  </main>                     │
├──────────────────────────────┤
│  Footer (© year React 4 fun) │
└──────────────────────────────┘
```

---

## Components

### `Navbar` (`src/components/Navbar.jsx`)

Sticky top bar, always visible across all routes.

- Brand link: **React 4 fun** → navigates to `/`
- Nav link: **Interest in Products** → navigates to `/`, active style applied via `NavLink`
- Placeholder comment for additional menu items
- Styles: `.navbar`, `.navbar-inner`, `.navbar-brand`, `.navbar-links`

---

## Pages

### Interest Page (`src/pages/InterestPage.jsx`) — route `/`

The main functional page. Contains a Salesforce Web-to-Lead HTML form styled to match the site design.

#### Form behaviour

- Submits via native HTTP `POST` directly to Salesforce:
  ```
  https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DdM00000vOexx
  ```
- On successful submission Salesforce redirects the browser to `/thanks` (set via the hidden `retURL` field).
- No JavaScript fetch or AJAX is involved; the browser navigates away on submit.

#### Hidden fields

| Field name | Value | Purpose |
|---|---|---|
| `oid` | `00DdM00000vOexx` | Identifies the Salesforce org |
| `lead_source` | `Web` | Populates Lead Source picklist |
| `retURL` | `https://react-for-fun.vercel.app/thanks` | Redirect target after submit |

#### Visible fields

| HTML `name` | Label shown | Required | Notes |
|---|---|---|---|
| `salutation` | Salutation | No | Select picklist |
| `first_name` | First Name | **Yes** | |
| `last_name` | Last Name | **Yes** | |
| `email` | Email | **Yes** | `type="email"` |
| `phone` | Phone | No | `type="tel"` |
| `company` | Company | **Yes** | |
| `city` | City | No | |
| `country_code` | Country | No | Curated European + US list |
| `street` | Street | No | textarea |
| `state_code` | State/Province | No | Free text input |
| `zip` | Zip | No | |
| `description` | **Product Interest** | No | Label intentionally renamed — see Salesforce note below |

Required fields are marked with a red asterisk via CSS `:has()` selector.

#### Layout

- Desktop: 2-column grid; Salutation + First Name + Last Name share one dedicated 3-column name row (salutation narrower at `0.8fr`).
- Mobile (≤768px): single column, all rows stacked.

---

### Thanks Page (`src/pages/ThanksPage.jsx`) — route `/thanks`

Confirmation page shown after the lead form is submitted. Salesforce redirects here via the `retURL` hidden field.

- Green circular checkmark icon
- Heading: *Thank you!*
- Short confirmation message
- **Back to Home** button (React Router `<Link>` to `/`)

---

## Salesforce Web-to-Lead Integration

### How it works

1. User fills the form on `/` and clicks **Submit Request**.
2. Browser posts form data directly to the Salesforce Web-to-Lead endpoint.
3. Salesforce creates a Lead record with the posted field values.
4. Salesforce redirects the browser to the `retURL` (`/thanks`).
5. React Router renders `ThanksPage`.

### Known limitations and workarounds

#### `lead_source` — resolved
Web-to-Lead does not include `lead_source` in its generated form by default. The hidden input `<input type="hidden" name="lead_source" value="Web" />` is added manually to always populate Lead Source with "Web".

#### Product Interest — workaround in place
The standard Lead field `Product Interest` is a multi-select picklist and cannot be added to the Web-to-Lead form picker. The workaround:

1. The visible form field labelled **Product Interest** actually posts to the Salesforce `description` field (`name="description"`), which Web-to-Lead does support.
2. A Salesforce record-triggered **Flow** on Lead create must copy `Description` into the real `Product Interest` field.
3. The intention is documented in a JSX comment on the field.

#### Custom fields
Any Salesforce custom Lead field must be referenced by its `00N...` field ID (not its API name) in the HTML `name` attribute. The ID is obtained by including the field in the Web-to-Lead form generator in Salesforce Setup and reading the generated HTML.

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
| `.form-card` | Modifier on `.page-card` that widens max-width to 860px for the form |
| `.form-grid` | 2-column CSS grid for form fields |
| `.name-row` | 3-column sub-grid (`0.8fr 1.2fr 1.2fr`) for Salutation/First/Last |
| `.field` | Flex column wrapper for label + input pairs |
| `.field-full` | Spans both columns (`grid-column: 1 / -1`) |
| `.btn-primary` | Blue rounded button (`#2563eb`) |

---

## Deployment (Vercel)

`vercel.json` contains a catch-all rewrite rule so that Vercel always serves `index.html` for any path, allowing React Router's client-side routing to work correctly:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Without this rule, a direct browser visit to `/thanks` would return a 404 from Vercel.

---

## Extending the Site

- **Add a menu item:** add a `<li><NavLink>` inside the `<ul>` in `Navbar.jsx`.
- **Add a page:** create `src/pages/NewPage.jsx`, add a `<Route>` in `App.jsx`, and link it in `Navbar.jsx`.
- **Add a custom Salesforce field:** include the field in the Web-to-Lead form generator, copy the `00N...` name from the generated HTML, and add a matching `<input>` in `InterestPage.jsx`.
