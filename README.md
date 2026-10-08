# La Nouvelle Café & Restaurant

A full-stack modern café & bistro web application built with TanStack Start, React 19, Tailwind CSS v4, and Prisma ORM with SQLite.

## Features

- **Public Experience**: Interactive luxury bistro website, digital menu with rich dish presentations, cart, multi-channel checkout (pickup / delivery / dine-in), and secure token-based order tracking.
- **Table Reservations**: Real-time reservation booking system with party size, date/time picker, and special requests.
- **Staff & Admin Portal**:
  - Live orders board with real-time status management.
  - Reservation management.
  - Interactive menu and category editor.
  - Café settings configuration (hours, delivery fees, contact info, toggle order types).
  - Staff access management.
- **Standalone Database**: Prisma with SQLite (`dev.db`), requiring zero external database or cloud setup.

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or pnpm

### Installation

```bash
npm install
```

### Database Setup

The database uses SQLite and Prisma. To set up or sync the local database:

```bash
npx prisma db push
node --experimental-strip-types prisma/seed.ts
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or the port specified by Vite in the terminal).

### Production Build

```bash
npm run build
npm run preview
```
