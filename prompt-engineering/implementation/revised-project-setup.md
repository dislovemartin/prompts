# SolnAI Project Setup Implementation Guide

## 📋 Overview

This guide provides detailed instructions for implementing the initial setup of the SolnAI Next.js application. It covers project initialization, directory structure creation, and base component implementation.

## 🔧 Technology Stack

Reference: [SOLNAI:TECH-STACK]

Make sure to use the exact versions specified in the technology stack reference to ensure compatibility across all components.

## 🚀 Project Initialization

Reference: [SOLNAI:PROJECT-INIT]

After running the initialization commands, verify that your project structure matches the expected output. You should have a Next.js 14 project with TypeScript, Tailwind CSS, and ESLint configured.

## 🗂️ Directory Structure

Reference: [SOLNAI:DIRECTORY-STRUCTURE]

Follow the directory structure exactly as specified in the reference. This structure ensures proper organization of components, routes, and utilities throughout the application.

## 🛠️ Implementation Steps

### Step 1: Setup Environment

1. Create a `.env.local` file in the project root
2. Add the following environment variables:

   ```
   NEXT_PUBLIC_APP_NAME=SolnAI
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Step 2: Configure Tailwind CSS

Update the `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Step 3: Create Core Utility Functions

Create a utility file at `src/lib/utils.ts`:

```tsx
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
```

### Step 4: Implement Button Component

Reference: [SOLNAI:BUTTON-COMPONENT]

Place the Button component implementation in `src/components/ui/Button.tsx` exactly as specified in the reference.

### Step 5: Implement Root Layout

Create `src/app/layout.tsx`:

```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolnAI - Intelligent Solutions',
  description: 'AI-powered solutions for your business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          {/* Header will be implemented in the next phase */}
          <main className="flex-1">{children}</main>
          {/* Footer will be implemented in the next phase */}
        </div>
      </body>
    </html>
  );
}
```

## ✅ Quality Standards

### Code Quality Standards

- **TypeScript Strictness**: Maintain strict TypeScript typing for all components and functions

  ```tsx
  // ✅ Good
  function UserProfile({ user }: { user: User }): JSX.Element {
    return <div>{user.name}</div>;
  }
  
  // ❌ Avoid
  function UserProfile({ user }): JSX.Element {
    return <div>{user.name}</div>;
  }
  ```

- **ESLint Compliance**: Ensure all code passes ESLint validation with no warnings or errors

  ```bash
  # Run ESLint before submitting any code
  pnpm lint
  ```

- **Naming Conventions**:
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Hooks: camelCase with 'use' prefix (e.g., `useUserData.ts`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)

- **Code Organization**:
  - Keep components focused on a single responsibility
  - Extract reusable logic into custom hooks
  - Group related functionality in dedicated directories

### Performance Standards

- **Avoid Unnecessary Re-renders**:
  - Use React.memo for expensive components
  - Properly memoize callback functions with useCallback
  - Memoize derived data with useMemo

- **Optimize Images**:
  - Use Next.js Image component with proper sizing
  - Implement lazy loading for off-screen images
  
- **Code Splitting**:
  - Use dynamic imports for large components
  - Implement route-based code splitting

### Accessibility Standards

- **Semantic HTML**:
  - Use appropriate HTML elements (button, nav, header, etc.)
  - Implement proper heading hierarchy (h1, h2, etc.)

- **ARIA Attributes**:
  - Add aria-label to elements without visible text
  - Use aria-expanded for expandable UI elements
  - Implement aria-controls to associate controls with content

- **Keyboard Navigation**:
  - Ensure all interactive elements are keyboard accessible
  - Maintain logical tab order
  - Implement keyboard shortcuts where appropriate

- **Color Contrast**:
  - Ensure text meets WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
  - Don't rely on color alone to convey information

### Security Standards

- **Input Validation**:
  - Validate all user inputs using Zod schemas
  - Sanitize data before rendering to prevent XSS

- **Authentication Protection**:
  - Secure sensitive routes using appropriate middleware
  - Implement proper session timeout and refresh logic

- **Environment Variables**:
  - Never expose sensitive keys in client-side code
  - Use NEXT_PUBLIC_ prefix only for publicly safe variables

## 🔍 Verification Checklist

Use this checklist to verify your implementation:

- [ ] Project initialized with correct Next.js configuration
- [ ] Directory structure matches the reference specification
- [ ] Environment variables are set correctly
- [ ] Tailwind CSS is configured properly
- [ ] Core utility functions are implemented
- [ ] Button component is implemented according to the reference
- [ ] Root layout is properly set up
- [ ] Application runs without errors (`pnpm dev`)
- [ ] All quality standards are met
