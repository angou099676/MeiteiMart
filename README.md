# MeiteiMart Monorepo

Quick-commerce platform for daily essentials (fruits, vegetables, dairy, groceries, personal care, medicines, electronics accessories, etc.) built as a multi-portal MERN monorepo.

## Portals

| # | Portal | Path | Platforms |
|---|--------|------|-----------|
| 1 | Admin Portal (incl. Super Admin) | `apps/admin-web` | Web |
| 2 | Customer Portal | `apps/customer-web`, `apps/customer-mobile` | Web, iOS, Android |
| 3 | Delivery Partner Portal | `apps/delivery-web`, `apps/delivery-mobile` | Web, iOS, Android |
| 4 | Seller Portal | `apps/seller-web`, `apps/seller-mobile` | Web, iOS, Android |
| 5 | Customer Support Portal | `apps/support-web` | Web |

All portals talk to a single backend: `services/api`.

## Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO (live order/delivery tracking + chat), Resend (email OTP), Fast2SMS (mobile OTP), Vercel Blob (file storage), JWT auth, RBAC.
- **Web portals**: React + Vite + Tailwind CSS.
- **Mobile apps**: React Native + Expo (shared UI patterns with web).
- **Deployment**: Vercel (frontends + serverless-friendly API), MongoDB Atlas.

## Monorepo layout

```
apps/
  admin-web/           Super Admin + Admin dashboard (web)
  customer-web/        Customer storefront (web)
  delivery-web/        Delivery partner console (web)
  seller-web/          Seller/vendor dashboard (web)
  support-web/         Customer support agent console (web)
  customer-mobile/     Customer app (Expo - iOS/Android)
  delivery-mobile/      Delivery partner app (Expo - iOS/Android)
  seller-mobile/        Seller app (Expo - iOS/Android)
services/
  api/                 Express + MongoDB backend (all portals + future services)
packages/
  shared/              Shared constants (roles/permissions/order status), validation schemas, API client, socket event names
  ui/                  Shared design tokens / tailwind preset for web apps
```

## Roles & RBAC

Roles are stored in the DB (`Role` model) and are fully data-driven — new roles/permissions can be added without code changes. Seeded default roles:

- `SUPER_ADMIN` — full system access, manages Admins, Roles/Permissions, all portals.
- `ADMIN` — operations: catalog, orders, sellers, delivery partners, support, reports.
- `SELLER` — manages own store, products, inventory, seller orders.
- `DELIVERY_PARTNER` — accepts/deliver orders, live location tracking.
- `CUSTOMER` — browse, order, track, support tickets.
- `SUPPORT_AGENT` — handles support tickets/chat.
- `SUPPORT_ADMIN` — manages support agents + escalations.

Permissions are fine-grained strings, e.g. `product:create`, `order:read:any`, `payout:approve`. See [packages/shared/src/rbac/permissions.js](packages/shared/src/rbac/permissions.js).

## Auth

Passwordless only: **Email OTP (Resend)** or **Mobile OTP (Fast2SMS)**. No password login. See [services/api/src/modules/auth](services/api/src/modules/auth).

## Getting started

```bash
npm install
cp services/api/.env.example services/api/.env   # fill in secrets
npm run dev:api
npm run dev:admin      # in another terminal
```

Future add-on services (planned, not yet scaffolded): **Porter** (intercity door-to-door pickup/delivery), **FindHelper** (daily worker/helper booking), **RentTool** (tool/machine/furniture rental). These will be added as new apps/services in this same monorepo.
# MeiteiMart
# MeiteiMart
