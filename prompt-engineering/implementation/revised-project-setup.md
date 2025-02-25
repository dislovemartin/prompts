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

Reference: [SOLNAI:QUALITY-STANDARDS]

Ensure all implemented components adhere to the quality standards specified in the reference.

## 🔍 Verification Checklist

Use this checklist to verify your implementation:

- [ ] Project initialized with correct Next.js configuration
- [ ] Directory structure matches the reference specification
- [ ] Environment variables are set correctly
- [ ] Tailwind CSS is configured properly
- [ ] Core utility functions are implemented
- [ ] Button component is implemented according to the reference
- [ ] Root layout is properly set up
- [ ] Application runs without errors (`npm run dev`)
- [ ] All quality standards are met
