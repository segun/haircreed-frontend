# HairCreed Frontend Development Guide

## Architecture Overview

This is a **React 19 + TypeScript + Vite** Point-of-Sale (POS) system for a hair wig business. The app uses **InstantDB** as a real-time database (not a traditional REST backend for data queries) and has a **separate REST API** for auth, business logic, and reporting.

### Dual Data Architecture
- **InstantDB**: Real-time reactive queries for entities (Users, Orders, Inventory, Customers, etc.) via `db.useQuery()` hooks
- **REST API**: Traditional endpoints for authentication, dashboard analytics, PDF generation, and complex operations
- API base URL and endpoints configured via `VITE_API_*` environment variables

## Key Technologies

- **Frontend**: React 19, TypeScript, React Router v7, TailwindCSS v4, Vite
- **Database**: InstantDB (`@instantdb/react`) - schema-first with type safety
- **UI Libraries**: Lucide React (icons), React Hot Toast (notifications), Recharts (charts)
- **Styling**: TailwindCSS v4 with Vite plugin (no PostCSS config needed)

## Project Structure

```
src/
├── instant.ts              # InstantDB initialization & schema export
├── instant.schema.ts       # Type-safe schema wrapper
├── instant.perms.ts        # InstantDB permissions rules
├── types/index.ts          # Global TypeScript types (derived from InstantDB schema)
├── api/                    # REST API client functions (auth, reports, dashboard)
├── components/
│   ├── admin/              # Admin-specific components (forms, tables, reports)
│   ├── charts/             # Recharts visualization components
│   ├── common/             # Reusable UI (Modal, ConfirmDialog, LoadingIndicator)
│   ├── layouts/            # AdminLayout with sidebar navigation
│   └── orders/             # POS-specific components
├── pages/                  # Route-level page components
└── hooks/                  # Custom React hooks
```

## InstantDB Patterns

### Schema & Types
- Schema defined in `instant.ts` using `i.schema()` - single source of truth
- Types auto-generated: `InstaQLEntity<Schema, 'EntityName'>` in `types/index.ts`
- Links define relationships (e.g., `CustomerOrder`, `InventoryItemSupplier`)

### Data Fetching
```typescript
// Reactive queries with relationships
const { isLoading, error, data } = db.useQuery({
  InventoryItems: {
    attributes: { category: {} },  // Nested relationships
    supplier: {},
  },
});

// One-time queries (e.g., customer search)
const { data } = await db.queryOnce({
  Customers: {
    $: { where: { email: 'user@example.com' } },
    addresses: {},
    orders: {},
  },
});
```

### Common Entities
- `Users`: roles (POS_OPERATOR, ADMIN, SUPER_ADMIN), `requiresPasswordReset` flag
- `Orders`: contains `items` (JSON), `statusHistory` (JSON), linked to Customer & POS operator
- `InventoryItems`: linked to Supplier and many AttributeItems (many-to-many)
- `AttributeCategory` / `AttributeItem`: flexible product attributes (Size, Color, Style, etc.)
- `AppSettings`: single entity storing business config (VAT rate, logo, name) as JSON

## Authentication & Authorization

- **Login flow**: `localStorage.getItem('user')` → hydrate state in `App.tsx`
- **Password reset**: Users with `requiresPasswordReset: true` redirected to `/password-reset`
- **Role-based routing**: POS_OPERATOR restricted to `/orders` only (enforced in `App.tsx` and `AdminLayout`)
- **No tokens**: User object stored directly in localStorage (consider security implications)

## Component Conventions

### Standard Props Pattern
```typescript
// Pages receive user and logout handler
type PageProps = {
  user: User;
  onLogout: () => void;
};

// Admin components trigger refetch via callback
type AdminComponentProps = {
  onUpdate: () => void;  // Trigger parent refetch after mutations
};
```

### Layout Usage
All authenticated pages wrap content in `<AdminLayout>`:
```tsx
<AdminLayout user={user} onLogout={onLogout} pageTitle="Page Title">
  {/* Page content */}
</AdminLayout>
```

### Loading & Error States
- Use `LoadingIndicator` component (CSS-based spinner overlay)
- `isLoading` state disables interactions and shows overlay
- Errors displayed inline with `<p className="text-sm text-red-500 bg-red-100 p-2 rounded-md">`

## REST API Integration

### API Module Pattern
Each API file (e.g., `api/auth.ts`, `api/orders.ts`) constructs URLs from env vars:
```typescript
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_ORDERS_ENDPOINT}`;

export const createOrder = async (orderData: any) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
};
```

### Environment Variables
Required in `.env`:
- `VITE_API_BASE_URL`: Backend base URL
- `VITE_API_AUTH_ENDPOINT`, `VITE_API_ORDERS_ENDPOINT`, etc.: Endpoint paths

## Development Workflow

### Commands
```bash
npm run dev      # Start Vite dev server (default: http://localhost:5173)
npm run build    # TypeScript compile + Vite production build
npm run preview  # Preview production build locally
npm run lint     # ESLint with React hooks & refresh plugins
```

### Common Tasks
1. **Add new entity**: Update `instant.ts` schema → types auto-generated → create API module if REST needed
2. **New page**: Create in `pages/` → add route in `App.tsx` → update `AdminLayout` navigation array
3. **New component**: Follow folder structure (`admin/`, `common/`, etc.) → use TypeScript types from `types/index.ts`

## Styling Guidelines

- **TailwindCSS v4** with Vite plugin (no separate PostCSS setup)
- Zinc color palette for UI (`bg-zinc-800`, `text-zinc-600`, etc.)
- Responsive: Mobile-first with `md:` breakpoints (sidebar toggle on mobile)
- Common patterns:
  - Cards: `bg-white p-6 rounded-lg shadow-md`
  - Buttons: `px-4 py-2 text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-md`
  - Inputs: `block w-full px-3 py-2 border border-zinc-300 rounded-md`

## Important Notes

- **No direct DB writes from frontend**: All mutations go through REST API (e.g., `createOrder()`, `updateUser()`)
- **InstantDB for reads only**: Queries are reactive and real-time, writes via backend
- **Role enforcement**: UI-level only in `AdminLayout` (disabled links) - backend must enforce security
- **Toast notifications**: Use `react-hot-toast` for user feedback on actions
- **Type safety**: Leverage `InstaQLEntity` types - avoid `any` for entities

## Testing & Debugging

- Check `roadmap.txt` for feature status and planned work
- InstantDB queries log to console when `db.queryOnce()` runs
- Use React DevTools to inspect `db.useQuery()` hook state
- Backend API errors surfaced via `throw new Error()` in API modules
