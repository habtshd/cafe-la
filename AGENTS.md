# Project Rules & Architecture

- **Stack**: TanStack Start + React 19 + Vite 8 + Tailwind CSS v4 + Prisma ORM with SQLite (`dev.db`).
- **Database**: Local SQLite database managed via Prisma (`prisma/schema.prisma`). All database operations run through `src/lib/prisma.ts`.
- **Order Security**: Orders and reservations are inserted only by server functions in `src/lib/cafe.functions.ts`; prices are recomputed server-side so customers cannot tamper with totals.
- **Order Tracking**: Customers track orders by an unguessable `tracking_token`, never by order number, preventing unauthorized access.
- **Staff Access**: Staff management uses the `user_roles` table in SQLite; administrative operations are handled in `src/lib/admin.functions.ts`.
- **Business Settings**: Business facts (address, hours, socials, offered order types) live in the `business_settings` table and are editable by admins — never hardcode or invent them.
- **Standalone**: Standalone deployment and development without external Supabase or Lovable dependencies.
