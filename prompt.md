# SolnAI Project Initialization Guide

## 📋 Task Overview

This guide provides a structured approach to initialize the SolnAI Next.js application using the project's prompt engineering system. Following these steps will establish the foundation for the application, setting up the directory structure, installing dependencies, and configuring essential components.

**Task Type:** Project Setup
**Priority:** High
**Estimated Effort:** Medium

## 🎯 Development Objectives

- Set up a clean, properly structured Next.js application following SolnAI standards
- Install all required dependencies with correct versions
- Configure TypeScript, ESLint, Tailwind CSS, and other core tools
- Establish the base directory structure for the application
- Implement foundation components and layouts

## 🔍 Requirements Analysis

### Functional Requirements

- [ ] Create a Next.js 14 application with App Router
- [ ] Set up authentication foundation
- [ ] Implement responsive layouts with dark mode support
- [ ] Configure global state management
- [ ] Establish API integration patterns

### Technical Requirements

- [ ] Next.js 14.1.0+ with TypeScript 5.3.0+
- [ ] Tailwind CSS 3.4.1 with proper configuration
- [ ] shadcn/ui 0.8.0 for component library
- [ ] Supabase authentication integration
- [ ] Proper folder structure following SolnAI conventions

### UX/UI Requirements

- [ ] Implement responsive design for all viewport sizes
- [ ] Support both light and dark mode
- [ ] Ensure consistent component styling
- [ ] Implement proper loading states
- [ ] Follow accessibility standards

## 🛠️ Implementation Steps

### Phase 1: Project Initialization

1. **Create Next.js Project**

   ```bash
   # Create a new Next.js project with the specified options
   npx create-next-app@latest solnai-app --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*"
   
   # Navigate to the project directory
   cd solnai-app
   ```

2. **Convert to pnpm (Recommended)**

   ```bash
   # Initialize pnpm
   npm install -g pnpm
   rm -rf node_modules package-lock.json
   pnpm install
   ```

3. **Install Core Dependencies**

   ```bash
   pnpm add @tanstack/react-query@5.24.0 zustand@4.5.0 zod@3.22.0 framer-motion@11.0.0 @supabase/ssr
   pnpm add -D @typescript-eslint/eslint-plugin@5.62.0 @typescript-eslint/parser@5.62.0 prettier@3.2.0 husky@9.0.0 vitest@1.3.0 @playwright/test@1.42.0
   ```

4. **Install shadcn/ui**

   ```bash
   # Install shadcn CLI
   pnpm add -D @shadcn/ui
   
   # Initialize shadcn/ui
   npx shadcn-ui@latest init
   ```

### Phase 2: Project Structure Setup

1. **Create Directory Structure**

   Create the following directory structure according to SolnAI standards:

   ```text
   src/
   ├── app/
   │   ├── (auth)/                  # Auth-related pages
   │   │   ├── login/
   │   │   ├── register/
   │   │   └── layout.tsx
   │   ├── (dashboard)/             # Dashboard-related pages
   │   │   ├── dashboard/
   │   │   ├── solutions/
   │   │   ├── settings/
   │   │   └── layout.tsx
   │   ├── api/                     # API routes
   │   │   ├── auth/
   │   │   └── trpc/
   │   ├── error.tsx
   │   ├── globals.css
   │   ├── layout.tsx
   │   ├── not-found.tsx
   │   └── page.tsx
   ├── components/
   │   ├── analytics/
   │   ├── auth/
   │   ├── dashboard/
   │   ├── layout/
   │   │   ├── Footer.tsx
   │   │   ├── Header.tsx
   │   │   ├── MainNav.tsx
   │   │   ├── SearchBar.tsx
   │   │   └── Sidebar.tsx
   │   ├── solutions/
   │   └── ui/                      # shadcn UI components
   ├── lib/
   │   ├── api/
   │   ├── store/
   │   ├── supabase/
   │   │   ├── client.ts
   │   │   └── server.ts
   │   └── utils/
   │       ├── formatting.ts
   │       └── validation.ts
   ├── styles/
   │   └── globals.css
   ```

2. **Configure TypeScript**

   Update the `tsconfig.json` file:

   ```json
   {
     "compilerOptions": {
       "target": "es2017",
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

### Phase 3: Core Configuration

1. **Configure Tailwind CSS**

   Update `tailwind.config.js`:

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

2. **Set Up Environment Variables**

   Create a `.env.local` file:

   ```
   NEXT_PUBLIC_APP_NAME=SolnAI
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Configure Supabase Client**

   Create Supabase client files:

   ```typescript:src/lib/supabase/client.ts
   import { createBrowserClient } from '@supabase/ssr'

   export const createClient = () => {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     )
   }
   ```

   ```typescript:src/lib/supabase/server.ts
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'

   export const createClient = () => {
     const cookieStore = cookies()

     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name) {
             return cookieStore.get(name)?.value
           },
           set(name, value, options) {
             cookieStore.set({ name, value, ...options })
           },
           remove(name, options) {
             cookieStore.set({ name, value: '', ...options })
           },
         },
       }
     )
   }
   ```

### Phase 4: Core Components

1. **Implement Root Layout**

   Create the root layout file:

   ```tsx:src/app/layout.tsx
   import { Inter } from 'next/font/google'
   import './globals.css'
   import { ThemeProvider } from '@/components/theme-provider'

   const inter = Inter({ subsets: ['latin'] })

   export const metadata = {
     title: 'SolnAI',
     description: 'SolnAI application powered by Next.js',
   }

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <body className={inter.className}>
           <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
             {children}
           </ThemeProvider>
         </body>
       </html>
     )
   }
   ```

2. **Create Theme Provider**

   ```tsx:src/components/theme-provider.tsx
   'use client'

   import * as React from 'react'
   import { ThemeProvider as NextThemesProvider } from 'next-themes'
   import { type ThemeProviderProps } from 'next-themes/dist/types'

   export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
     return <NextThemesProvider {...props}>{children}</NextThemesProvider>
   }
   ```

3. **Implement Landing Page**

   ```tsx:src/app/page.tsx
   import Link from 'next/link'
   
   export default function Home() {
     return (
       <main className="flex min-h-screen flex-col items-center justify-center p-24">
         <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
           <h1 className="text-4xl font-bold mb-6">Welcome to SolnAI</h1>
           <p className="text-xl mb-8">
             Your next-generation AI-powered solution platform
           </p>
           <div className="flex gap-4">
             <Link 
               href="/login" 
               className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
             >
               Login
             </Link>
             <Link 
               href="/register" 
               className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
             >
               Register
             </Link>
           </div>
         </div>
       </main>
     )
   }
   ```

## 📝 Validation Criteria

To verify successful implementation of the project setup, check the following:

1. **Project Structure**
   - [ ] Directory structure follows SolnAI conventions
   - [ ] All required files are present
   - [ ] File naming follows project conventions

2. **Dependencies**
   - [ ] All required packages are installed with correct versions
   - [ ] No conflicting dependencies
   - [ ] TypeScript correctly configured

3. **Configuration**
   - [ ] ESLint and Prettier properly set up
   - [ ] Tailwind CSS configured with required plugins
   - [ ] Environment variables properly set

4. **Core Functionality**
   - [ ] Next.js development server starts without errors
   - [ ] Landing page renders correctly
   - [ ] Theme switching functions properly
   - [ ] Basic navigation works

5. **Code Quality**
   - [ ] TypeScript types properly defined
   - [ ] No ESLint warnings or errors
   - [ ] Consistent code style

## 🚀 Next Steps

After successfully initializing the project:

1. Implement the authentication system following the Authentication module
2. Set up the dashboard layout and navigation
3. Implement the core solution management features
4. Add user settings and profile management
5. Implement the analytics features

## 📚 Reference Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [SolnAI Development Guidelines](prompt-engineering/rules/development-guidelines.mdc)

---

This prompt has been structured according to SolnAI standards and provides a comprehensive guide to initialize your project. Follow each step carefully to ensure a solid foundation for your application.
