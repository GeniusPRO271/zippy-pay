# Zippy Pay Frontend

Next.js 15 dashboard application with React 19, Radix UI, and TanStack Query.

## Tech Stack

### Core Framework
- **Next.js** `^15.5.9` - React framework with App Router
- **React** `19.1.0` - UI library
- **TypeScript** `^5` - Type safety

### UI Components
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-dialog`, `react-dropdown-menu`, `react-select`, `react-tabs`, etc.
- **Tailwind CSS** `^4` - Utility-first CSS
- **Lucide React** `^0.544.0` - Icon library
- **next-themes** `^0.4.6` - Dark mode support

### State & Data Fetching
- **TanStack Query** `^5.89.0` - Server state management
- **Axios** `^1.12.2` - HTTP client
- **TanStack Table** `^8.21.3` - Data tables

### Forms & Validation
- **React Hook Form** `7.53.1` - Form state management
- **Zod** `^4.1.8` - Schema validation
- **@hookform/resolvers** `3.9.0` - Form validation integration

### Database (Server Components)
- **Drizzle ORM** `^0.44.5` - Type-safe database queries
- **@neondatabase/serverless** `^1.0.1` - Neon Postgres driver
- **postgres** `^3.4.7` - PostgreSQL client

### Charts & Visualization
- **Recharts** `2.15.4` - Chart library
- **date-fns** `^4.1.0` - Date utilities
- **date-fns-tz** `^3.2.0` - Timezone support

### Utilities
- **class-variance-authority** `^0.7.1` - CSS class variants
- **clsx** `^2.1.1` - Conditional classNames
- **tailwind-merge** `^3.3.1` - Merge Tailwind classes
- **cmdk** `^1.1.1` - Command palette
- **sonner** `^2.0.7` - Toast notifications
- **uuid** `^13.0.0` - UUID generation
- **jose** `^6.1.3` - JWT handling

### Dev Tools
- **ESLint** `^9` - Linting
- **eslint-config-next** `15.5.3` - Next.js ESLint config
- **drizzle-kit** `^0.31.4` - Database migrations

## Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3110

# JWT Secret (must match backend SESSION_SECRET)
SESSION_SECRET=your-256-bit-secret-key-here

# Database (for server components, optional)
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Installation

```bash
cd frontend
bun install
```

## Development

```bash
# Start dev server with Turbopack
bun run dev

# Or with npm/pnpm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

### Local Production Build

```bash
# Build for production
bun run build

# Start production server
bun start
```

### Docker Build

```bash
docker build -t zippy-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg SESSION_SECRET=your-secret \
  .

docker run -p 3000:3000 zippy-frontend
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `SESSION_SECRET`

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth layout group
│   │   └── login/           # Login page
│   ├── (dashboard)/         # Dashboard layout group
│   │   ├── layout.tsx       # Sidebar + nav layout
│   │   ├── page.tsx         # Dashboard home
│   │   ├── transactions/    # Transaction management
│   │   ├── merchants/       # Merchant management
│   │   ├── reports/         # Report generation
│   │   ├── analytics/       # Charts & statistics
│   │   └── settings/        # Settings pages
│   ├── api/                 # API routes (middleware)
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Radix UI primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── data-table.tsx       # Reusable data table
│   ├── sidebar.tsx          # Dashboard sidebar
│   ├── header.tsx           # Page header
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts          # Authentication hook
│   ├── use-transactions.ts  # Transaction queries
│   ├── use-merchants.ts     # Merchant queries
│   └── ...
├── lib/                     # Utilities
│   ├── api.ts               # Axios instance config
│   ├── auth.ts              # JWT helpers
│   ├── utils.ts             # Helper functions
│   └── ...
├── context/                 # React context providers
│   └── auth-context.tsx     # Auth state context
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware (JWT check)
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── package.json
```

## Key Features

### 1. Authentication

- JWT-based authentication
- Protected routes via middleware (`middleware.ts`)
- Login page with email/password
- Token refresh mechanism
- Role-based UI (superadmin, admin, analyst, merchant)

### 2. Dashboard Pages

#### Transactions
- Paginated transaction list
- Filters: date range, merchant, provider, country, status
- Bulk import from Excel
- Transaction details modal
- Export to CSV/Excel

#### Merchants
- CRUD operations for merchants
- Merchant configuration by country
- PayMethod assignment
- Approval rate statistics

#### Reports
- Generate custom reports
- Job status tracking
- Download from S3 pre-signed URLs
- Excel/CSV format selection

#### Analytics
- Approval rate charts (Recharts)
- Transaction volume over time
- Merchant performance comparison
- Country/provider breakdown

### 3. UI Components

All components built with:
- **Radix UI** for accessibility
- **Tailwind CSS** for styling
- **CVA** (Class Variance Authority) for variants
- **Dark mode** support with `next-themes`

Example usage:

```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

<Button variant="primary" size="lg">
  Click me
</Button>
```

### 4. Data Fetching Pattern

Using TanStack Query for server state:

```tsx
// hooks/use-transactions.ts
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useTransactions(filters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => api.get("/transactions", { params: filters }),
  })
}

// In component
const { data, isLoading, error } = useTransactions({ status: "approved" })
```

### 5. Forms

Using React Hook Form + Zod:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## API Integration

### Axios Configuration

The `lib/api.ts` file configures Axios with:
- Base URL from `NEXT_PUBLIC_API_URL`
- Automatic JWT token injection
- Token refresh on 401 errors
- Error handling

```tsx
import { api } from "@/lib/api"

// GET request
const { data } = await api.get("/merchants")

// POST request
await api.post("/transactions", { amount: 100 })
```

### Authentication Flow

1. User logs in via `/login`
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in httpOnly cookies (or localStorage)
4. `middleware.ts` validates JWT on protected routes
5. Axios interceptor refreshes token when expired

## Middleware

The `middleware.ts` file protects routes:

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")

  if (!token) {
    return NextRedirect("/login")
  }

  // Verify JWT
  const payload = await jwtVerify(token, secret)

  // Check role for admin routes
  if (pathname.startsWith("/admin") && payload.role !== "superadmin") {
    return NextRedirect("/dashboard")
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

## Styling

### Tailwind Setup

Configured with:
- Custom color palette
- Dark mode support
- Custom animations
- Component variants

```tsx
// Example with cn() utility
import { cn } from "@/lib/utils"

<div className={cn(
  "p-4 bg-white dark:bg-gray-900",
  isActive && "border-blue-500"
)} />
```

### Dark Mode

Using `next-themes`:

```tsx
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  )
}
```

## Performance Optimization

- **Turbopack**: Faster dev builds
- **Server Components**: Reduce client bundle size
- **Image Optimization**: Next.js `<Image>` component
- **Route Prefetching**: Automatic with Next.js links
- **Code Splitting**: Automatic per-route splitting
- **TanStack Query**: Request deduplication & caching

## Deployment Checklist

### 1. Environment Variables
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Set `SESSION_SECRET` (must match backend)
- Optionally set `DATABASE_URL` for server-side queries

### 2. Build Configuration
- Update `next.config.ts` if needed (CDN, headers, etc.)
- Ensure Docker build args are passed correctly

### 3. Backend Connection
- Verify CORS is configured on backend for frontend domain
- Test API connectivity from production frontend

### 4. Database Migrations (if using server components)
- Run `bunx drizzle-kit push` to sync schema
- Ensure connection pool settings are production-ready

### 5. Vercel Deployment (Recommended)
```bash
vercel --prod
```

Or connect GitHub repo in Vercel dashboard for automatic deployments.

## Troubleshooting

### API Connection Errors
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend CORS allows frontend origin
- Check network tab for 401/403 errors (auth issues)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && bun install`
- Check TypeScript errors: `bun run tsc --noEmit`

### Authentication Issues
- Verify `SESSION_SECRET` matches backend
- Check JWT token expiration
- Clear cookies and try logging in again

### Dark Mode Not Working
- Ensure `next-themes` ThemeProvider wraps app
- Check `tailwind.config.ts` has `darkMode: "class"`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/get-started)

## License

Private
