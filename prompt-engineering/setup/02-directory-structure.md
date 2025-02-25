# SolnAI Project Directory Structure

## 📂 Root Structure Overview

The SolnAI Next.js application follows a well-organized directory structure that separates concerns and promotes maintainability:

```
solnai-app/
├── .github/                # GitHub workflows and configuration
├── .husky/                 # Git hooks for code quality
├── public/                 # Static assets
├── src/                    # Application source code
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   ├── lib/                # Utility functions and libraries
│   ├── pages/              # Auth pages (Pages Router)
│   └── styles/             # Global styles
├── tests/                  # Test files
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project documentation
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 📁 Detailed Directory Structure

### App Directory (`/src/app/`)

The App Router directory organizes routes and their related components:

```
src/app/
├── (auth)/                  # Auth-related pages (grouped layout)
│   ├── login/               # Login page route
│   │   └── page.tsx         # Login page component
│   ├── register/            # Registration page route
│   │   └── page.tsx         # Registration page component
│   └── layout.tsx           # Auth group layout
├── (dashboard)/             # Dashboard-related pages (grouped layout)
│   ├── dashboard/           # Main dashboard route
│   │   ├── page.tsx         # Dashboard page component
│   │   └── loading.tsx      # Dashboard loading state
│   ├── solutions/           # Solutions management route
│   │   ├── [id]/            # Dynamic route for single solution
│   │   │   └── page.tsx     # Solution detail page
│   │   └── page.tsx         # Solutions list page
│   ├── settings/            # User settings route
│   │   └── page.tsx         # Settings page component
│   └── layout.tsx           # Dashboard group layout
├── api/                     # API routes
│   ├── auth/                # Authentication endpoints
│   │   └── [...nextauth]/   # NextAuth.js configuration
│   │       └── route.ts     # NextAuth API route
│   └── trpc/                # tRPC API routes
│       └── [trpc]/          # tRPC router configuration
│           └── route.ts     # tRPC API route
├── error.tsx                # Global error component
├── globals.css              # Global CSS styles
├── layout.tsx               # Root layout component
├── not-found.tsx            # 404 page component
└── page.tsx                 # Landing page component
```

### Components Directory (`/src/components/`)

Components are organized by their purpose and scope:

```
src/components/
├── analytics/               # Analytics-related components
│   ├── ActivityChart.tsx    # User activity visualization
│   ├── MetricsCard.tsx      # Key metrics display
│   └── UsageStats.tsx       # Usage statistics component
├── auth/                    # Authentication components
│   ├── LoginForm.tsx        # Login form component
│   ├── RegisterForm.tsx     # Registration form component
│   └── ResetPasswordForm.tsx# Password reset form
├── dashboard/               # Dashboard components
│   ├── DashboardHeader.tsx  # Dashboard header
│   ├── DashboardStats.tsx   # Dashboard statistics
│   └── RecentActivity.tsx   # Recent activity display
├── layout/                  # Layout components
│   ├── Footer.tsx           # Global footer component
│   ├── Header.tsx           # Global header component
│   ├── MainNav.tsx          # Main navigation component
│   ├── SearchBar.tsx        # Global search component
│   └── Sidebar.tsx          # Sidebar navigation component
├── solutions/               # Solution-related components
│   ├── SolutionCard.tsx     # Solution card component
│   ├── SolutionDetail.tsx   # Solution detail view
│   ├── SolutionFilters.tsx  # Solution filtering controls
│   └── SolutionGrid.tsx     # Grid layout for solutions
└── ui/                      # Reusable UI components
    ├── Badge.tsx            # Badge component
    ├── Button.tsx           # Button component
    ├── Card.tsx             # Card component
    ├── Dialog.tsx           # Dialog component
    ├── Dropdown.tsx         # Dropdown component
    ├── Input.tsx            # Input component
    ├── Tabs.tsx             # Tabs component
    └── Toast.tsx            # Toast notification component
```

### Library Directory (`/src/lib/`)

Utility functions and service integrations:

```
src/lib/
├── api/                     # API client and utilities
│   ├── client.ts            # API client configuration
│   ├── endpoints.ts         # API endpoint definitions
│   └── types.ts             # API type definitions
├── auth/                    # Authentication utilities
│   ├── auth-options.ts      # NextAuth configuration
│   └── session.ts           # Session management utilities
├── db/                      # Database utilities
│   ├── prisma.ts            # Prisma client instance
│   ├── schema.prisma        # Prisma schema definition
│   └── seed.ts              # Database seeding script
├── store/                   # State management
│   ├── slices/              # Zustand state slices
│   │   ├── auth-slice.ts    # Authentication state
│   │   ├── solution-slice.ts# Solution state
│   │   └── ui-slice.ts      # UI state
│   └── index.ts             # Store configuration
├── trpc/                    # tRPC configuration
│   ├── routers/             # tRPC routers
│   ├── procedures.ts        # tRPC procedures
│   └── trpc.ts              # tRPC setup
├── utils/                   # Utility functions
│   ├── date.ts              # Date formatting utilities
│   ├── format.ts            # Text formatting utilities
│   ├── validation.ts        # Input validation utilities
│   └── zod-schemas.ts       # Zod validation schemas
└── types/                   # TypeScript type definitions
    ├── auth.ts              # Authentication types
    ├── solution.ts          # Solution types
    └── user.ts              # User types
```

### Pages Directory (`/src/pages/`)

Pages Router for authentication (separated to prevent hydration issues):

```
src/pages/
├── _app.tsx                 # Custom App component
├── _document.tsx            # Custom Document component
├── auth/                    # Authentication pages
│   ├── login.tsx            # Login page
│   ├── register.tsx         # Registration page
│   ├── reset-password.tsx   # Password reset page
│   └── verify-email.tsx     # Email verification page
└── api/                     # API routes (if needed)
```

### Public Directory (`/public/`)

Static assets accessible via the web:

```
public/
├── favicon.ico              # Website favicon
├── logo.svg                 # SolnAI logo
├── robots.txt               # Search engine crawling instructions
├── sitemap.xml              # Site structure for search engines
├── fonts/                   # Web fonts
│   └── inter/               # Inter font family
├── icons/                   # Icon assets
│   ├── logo-dark.svg        # Dark mode logo
│   └── logo-light.svg       # Light mode logo
└── images/                  # Image assets
    ├── avatars/             # User avatar images
    ├── backgrounds/         # Background images
    └── illustrations/       # Illustration assets
```

### Tests Directory (`/tests/`)

Test files for the application:

```
tests/
├── components/              # Component tests
│   ├── ui/                  # UI component tests
│   └── features/            # Feature component tests
├── e2e/                     # End-to-end tests
│   ├── auth.spec.ts         # Authentication flow tests
│   └── dashboard.spec.ts    # Dashboard functionality tests
├── integration/             # Integration tests
│   ├── api.test.ts          # API integration tests
│   └── db.test.ts           # Database integration tests
└── unit/                    # Unit tests
    ├── utils.test.ts        # Utility function tests
    └── validators.test.ts   # Validation logic tests
```

## 🔍 Key Structural Principles

### 1. Route Group Organization

- **Route Groups** (in parentheses) share layouts without affecting URL paths
- **Dynamic Routes** use brackets ([id]) for variable path segments
- **Catch-all Routes** use [...slug] format for variable-length paths

### 2. Component Categorization

- **Layout Components** manage the overall page structure
- **UI Components** provide reusable interface elements
- **Feature Components** implement specific application features
- **Page Components** represent complete pages/routes

### 3. File Naming Conventions

- **Component Files**: PascalCase.tsx (e.g., Button.tsx)
- **Route Files**: lowercase/page.tsx
- **Utility Files**: camelCase.ts (e.g., dateUtils.ts)
- **Type Definition Files**: camelCase.ts (e.g., userTypes.ts)
- **Test Files**: [component/file-name].[test|spec].tsx

### 4. Special Files in App Router

- **layout.tsx**: Persistent UI within a route segment
- **page.tsx**: UI for a route segment
- **loading.tsx**: Loading UI for a route segment
- **error.tsx**: Error UI for a route segment
- **not-found.tsx**: UI for 404 errors
- **route.ts**: API endpoints

## 📌 Implementation Notes

1. **App vs Pages Router**:
   - App Router (src/app/) for main application routes
   - Pages Router (src/pages/) only for auth to prevent hydration issues

2. **Component Reusability**:
   - UI components should be highly reusable and well-typed
   - Feature components can be more specialized

3. **State Management Approach**:
   - Zustand for global UI state
   - React Query for server state
   - React Context for localized state when appropriate

4. **API Structure**:
   - tRPC for type-safe API routes
   - Next.js API routes for simpler endpoints

5. **CSS Organization**:
   - Tailwind utility classes preferred
   - Component-specific styles when needed
   - Global styles minimized

---

This directory structure provides a consistent foundation for the SolnAI application. Implementers should follow this structure closely to ensure maintainability and consistency across the codebase.
