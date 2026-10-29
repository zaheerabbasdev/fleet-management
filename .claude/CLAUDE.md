# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Habib Ullah Logistics — Fleet & HR Management System**: an internal ERP/operations dashboard for an Omani logistics company (Muscat). Covers employees/HR documents, fleet (trucks, Mulkiya/insurance), trips/dispatch, fuel, maintenance, payroll, advances, ROP fines, customers, invoicing (5% Omani VAT), general expenses, reports, notifications and settings. Currency is OMR (3 decimal places).

The app lives in `d:\Mazharhabib\logistics` (the parent folder only contains it).

## Tech stack

- Next.js 16.3.2 (App Router), React 19.2, TypeScript (strict), Tailwind CSS v4
- Prisma 7 with the MariaDB driver adapter (`@prisma/adapter-mariadb`) against MySQL/MariaDB
- Auth: JWT (`jose`, HS256, 24h) in the `session_token` cookie; passwords via `bcryptjs`
- Validation: `zod` v4 (API) and `react-hook-form` + `@hookform/resolvers` (forms)
- Charts: `recharts`; icons: `lucide-react`; file uploads: Cloudinary

## IMPORTANT: Next.js version

[AGENTS.md](../AGENTS.md) warns this Next.js has breaking changes versus training data. Before writing Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Note already: the old `middleware.ts` is replaced by [proxy.ts](../proxy.ts) (default-exported `proxy` function).

## Commands

Run from `logistics/`:

- `npm run dev` — dev server
- `npm run build` — `prisma generate && next build`
- `npm start` — production server
- `npm run lint` — ESLint
- `npm run seed` — runs `prisma/seed.ts` via ts-node
- `npx prisma migrate dev` — apply/create migrations (config in `prisma.config.ts`)

There is no test suite configured.

## Environment

Copy `.env.example` to `.env`. Variables: `DATABASE_URL` (mysql://…), `AUTH_SECRET` (JWT signing key), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Never commit `.env`.

## Structure

- `app/(auth)/login` — login page
- `app/(dashboard)/<module>/` — `page.tsx` (list), `new/page.tsx`, `[id]/page.tsx` for: customers, dashboard, employees, expenses, fines, fuel, invoices, maintenance, payroll, reports, settings, trips, trucks. Shared shell in `app/(dashboard)/layout.tsx`.
- `app/api/<module>/route.ts` (+ `[id]/route.ts`) — REST route handlers per module; also `auth/{login,logout}`, `notifications/*`, `upload`, `invoices/payments`, `employees/[id]/{documents,hr}`
- `components/layout/` — `Header`, `Sidebar`
- `lib/auth.ts` (JWT + bcrypt helpers), `lib/prisma.ts` (singleton client), `lib/vehicleCategories.ts`
- `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`
- `proxy.ts` — route protection

## Conventions (follow the existing code)

- **Auth/proxy**: `proxy.ts` redirects unauthenticated users to `/login?from=…`, and injects `x-user-id`, `x-user-email`, `x-user-role`, `x-user-name` request headers. Route handlers read `x-user-id` for audit logging. `/login` and `/api/auth*` are public; paths containing `.` are treated as static assets.
- **API handlers**: validate the body with a zod schema (`safeParse`; return `400` with `result.error.issues[0].message`), wrap in try/catch returning `{ error: "Internal Server Error" }` with `500`. List endpoints return `{ items, pagination: { page, pageSize, totalItems, totalPages } }` using `prisma.$transaction([count, findMany])`.
- **Audit log**: mutating handlers write an `AuditLog` row (`action`, `module`, `recordId`, `description`) with `.catch(console.error)` so logging never fails the request.
- **Business IDs**: human-readable unique IDs are stored in addition to autoincrement `id` (`empId` EMP-0001, `truckId` TRK-0001, `custId` CUST-0001, `tripId` TRP-0001, `fuelId` FUL-0001, `expenseId` EXP-0001, `invoiceNumber` INV-0001).
- **Money**: `Decimal(12,3)` in OMR; round computed totals with `Number(x.toFixed(3))`. Invoice total = subtotal + tax − discount. Salary net = (basic + allowances + overtime + bonus) − deductions.
- **Side effects to preserve**: fuel entries raise `Truck.odometer` if higher; trip `distance` = ending − starting odometer; fines can be deducted via payroll (`paymentStatus: Deducted`); advances reduce `remainingBalance` through monthly deductions.
- **Statuses are free-form strings** (not enums), documented in schema comments (e.g. Truck: Available/On Trip/Under Maintenance/Inactive/Sold). Only `UserRole` is a Prisma enum (ADMIN, OWNER, HR, ACCOUNTANT, FLEET_MANAGER).
- **Dates**: `@db.Date` fields; API accepts date strings and converts with `new Date(...)`. Salary month is a `YYYY-MM` string.
- Use the `@/` import alias. Tailwind dark slate/zinc UI.

## Known issues / watch-outs

- `lib/auth.ts` falls back to a hard-coded `AUTH_SECRET` if the env var is missing — always set `AUTH_SECRET` in real environments.
- `.env.example` currently contains what look like real Cloudinary credentials. Replace with placeholders and rotate the key/secret.
- `prisma/schema.prisma` has no `url` in the datasource (Prisma 7: connection comes from `prisma.config.ts` / the adapter in `lib/prisma.ts`).
- API handlers use `any` in places (e.g. `where: any`); prefer `Prisma.<Model>WhereInput` for new code.
- Role-based authorization is not enforced in route handlers yet; the role is only available via the `x-user-role` header.
