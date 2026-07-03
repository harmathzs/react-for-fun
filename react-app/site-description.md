# React 4 fun - Site Description

## Overview

React 4 fun is a React single-page application built with Vite and deployed on Vercel. It evolved from a pure Salesforce Web-to-Lead form into an authenticated webshop with account lifecycle management, checkout conversion, order history, and static support/content pages.

The app uses Salesforce as the system of record and stores session state in encrypted HttpOnly cookies.

## Current Capabilities

1. Lead capture via Web-to-Lead on the landing page.
2. Registration with email verification.
3. Login/logout and protected routes.
4. Account deletion and re-registration with the same email.
5. Checkout via Apex REST endpoint at /services/apexrest/webshop/checkout.
6. Lead conversion reuse for repeat orders (no re-conversion if Lead is already converted).
7. Order history page with accordion details and status badges.
8. Footer-linked static pages: About, Careers, Order Status, Shipping and Delivery, FAQ, Contact Us, Accessibility.

## Architecture Snapshot

- Frontend: React 18, react-router-dom v6, plain CSS.
- Backend: Vercel serverless API routes in api/.
- Salesforce auth: OAuth2 Client Credentials.
- Primary Apex REST in use: /services/apexrest/webshop/checkout.

## Main Routes

- Public: /, /thanks, /products, /cart, /about-us, /careers, /order-status, /shipping, /faq, /contact-us, /accessibility.
- Auth-protected: /shop, /account, /orders.
- Login/register routes redirect authenticated users back to /shop.

## Key API Endpoints

- /api/register: creates pending user flow and sends verification code.
- /api/verify: activates Webshop_User__c and creates SITE_SESSION cookie.
- /api/login and /api/logout: session lifecycle.
- /api/deleteAccount: deletes Webshop_User__c and clears cookies.
- /api/checkout: forwards checkout payload to Apex checkout endpoint and writes conversion IDs back to Webshop_User__c.
- /api/orders: fetches user orders and order items from Salesforce.

## Stability Notes

- Converted-lead safety is implemented in both register and verify flows:
  - Registration skips Lead verification reset when IsConverted=true.
  - Verification skips Lead sync when IsConverted=true.
  - This prevents CANNOT_UPDATE_CONVERTED_LEAD errors during delete-and-reregister scenarios.

## Deployment

- Hosted on Vercel.
- SPA rewrite in vercel.json routes non-API paths to index.html.
- API routes are served from the api/ directory as serverless functions.
