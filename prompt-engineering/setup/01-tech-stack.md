# SolnAI Technology Stack Specification

## 🔧 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | ^5.3.0 | Type-safe JavaScript development |
| Node.js | ^20.11.0 | JavaScript runtime environment |
| Next.js | ^14.1.0 | React framework with hybrid rendering |
| React | ^18.2.0 | UI component library |

## 🎨 Frontend Framework & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | ^3.4.1 | Utility-first CSS framework |
| shadcn/ui | ^0.8.0 | Accessible UI component library |
| Lucide React | ^0.299.0 | Icon library |
| Framer Motion | ^11.0.0 | Animation library |

## 📊 State Management & Data Fetching

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | ^4.5.0 | State management library |
| TanStack Query | ^5.24.0 | Data fetching and caching |
| tRPC | ^10.45.0 | End-to-end typesafe APIs |
| Zod | ^3.22.0 | TypeScript-first schema validation |

## 🔒 Authentication & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| Next-Auth | ^5.0.0 | Authentication for Next.js |
| Supabase | Latest | Backend-as-a-Service platform |
| Prisma | ^5.10.0 | ORM for database operations |

## 🧰 Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| pnpm | ^8.15.0 | Fast, disk-space efficient package manager |
| ESLint | ^8.57.0 | JavaScript/TypeScript linter |
| Prettier | ^3.2.0 | Code formatter |
| Husky | ^9.0.0 | Git hooks manager |

## 🧪 Testing Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | ^1.3.0 | Fast unit testing framework |
| Playwright | ^1.42.0 | End-to-end testing framework |

## 📱 Responsive Design Breakpoints

| Breakpoint | Size (px) | Description |
|------------|-----------|-------------|
| xs | < 640 | Extra small devices (phones) |
| sm | ≥ 640 | Small devices (large phones, small tablets) |
| md | ≥ 768 | Medium devices (tablets) |
| lg | ≥ 1024 | Large devices (laptops) |
| xl | ≥ 1280 | Extra large devices (desktops) |
| 2xl | ≥ 1536 | Very large devices (large desktops) |

## 🚨 Version Compatibility Requirements

- Next.js 14+ requires Node.js 18.17.0 or later
- shadcn/ui components require React 18 and Tailwind CSS 3.4+
- TanStack Query 5+ requires React 18+
- Next-Auth 5+ requires Next.js 14+

## 📦 Package Installation Commands

```bash
# Install core dependencies
pnpm add next@14.1.0 react@18.2.0 react-dom@18.2.0

# Install UI libraries
pnpm add tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.16
pnpm add lucide-react@0.299.0 framer-motion@11.0.0
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs

# Install state management & data fetching
pnpm add zustand@4.5.0 @tanstack/react-query@5.24.0
pnpm add @trpc/client@10.45.0 @trpc/server@10.45.0 @trpc/react-query@10.45.0
pnpm add zod@3.22.0

# Install authentication & database
pnpm add next-auth@5.0.0 @prisma/client@5.10.0
pnpm add -D prisma@5.10.0

# Install development tools
pnpm add -D typescript@5.3.0 @types/react@18.2.48 @types/react-dom@18.2.18
pnpm add -D eslint@8.57.0 prettier@3.2.0 husky@9.0.0
pnpm add -D vitest@1.3.0 @playwright/test@1.42.0
```

## 🔄 Configuration Files

### TypeScript Config (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind Config (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 📄 Browser Support Requirements

- Modern Chromium-based browsers (Chrome, Edge, etc.)
- Firefox 95+
- Safari 15.4+
- iOS Safari 15.4+
- Android Chrome 96+

## 🛡️ Security Requirements

- HTTPS enforced in production
- CSP (Content Security Policy) implemented
- CSRF protection via Next.js built-in protection
- Authentication state properly secured
- API routes protected from unauthorized access
- Environment variables properly secured
- Regular dependency updates for security patches

---

This technology stack specification serves as the definitive reference for all SolnAI implementation prompts. All implementations must adhere to these versioning and compatibility requirements unless explicitly specified otherwise.
