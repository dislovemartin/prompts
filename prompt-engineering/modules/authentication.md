# Authentication Implementation Guide

## 🔒 Overview

This module defines the authentication implementation for the SolnAI application. It covers user authentication flows, protected routes, and session management using Next-Auth and Supabase.

## 🔑 Authentication Architecture

The authentication system follows these key principles:


1. **Separation of Concerns**
   - Auth pages use Pages Router to prevent hydration issues
   - Main application uses App Router
   - Clear separation of client and server components

1. **Security First**
   - HTTPS for all auth requests
   - JWT with appropriate expiration
   - CSRF protection
   - Protected API routes

1. **User Experience**
   - Seamless sign-in/sign-up flows
   - Social authentication options
   - Persistent sessions when appropriate
   - Clear error messaging

## 📂 File Structure

```text
src/
├── pages/                     # Pages Router (for auth only)
│   ├── _app.tsx               # Custom App component with AuthProvider
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/ # NextAuth.js API route for auth requests
│   │           └── route.ts   # NextAuth implementation
│   └── auth/                  # Auth pages
│       ├── login.tsx          # Login page
│       ├── register.tsx       # Registration page
│       ├── reset-password.tsx # Password reset page
│       └── verify-email.tsx   # Email verification page
├── app/                       # App Router (protected app routes)
│   └── middleware.ts          # Route protection middleware
├── components/
│   └── auth/                  # Auth-related components
│       ├── LoginForm.tsx      # Login form component
│       ├── RegisterForm.tsx   # Registration form component
│       └── ResetPasswordForm.tsx # Password reset form
└── lib/
    └── auth/                  # Auth utilities
        ├── auth-options.ts    # NextAuth configuration
        ├── session.ts         # Session utilities
        └── supabase.ts        # Supabase client configuration

```text

## 🔧 NextAuth Configuration

The NextAuth configuration handles authentication providers and callbacks:

```typescript
// src/lib/auth/auth-options.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data.user) {
          return null
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || null,
          image: data.user.user_metadata?.avatar_url || null,
        }
      }
    }),

    // GitHub authentication
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Google authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Custom authentication pages
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },

  // JWT settings
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks for customizing authentication behavior
  callbacks: {
    async jwt({ token, user }) {
      // Include user ID and role in the JWT
      if (user) {
        token.id = user.id

        // Fetch user role from Supabase
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        token.role = data?.role || 'user'
      }
      return token
    },

    async session({ session, token }) {
      // Make user ID and role available in the session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  // Security and cookie settings
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

````text

## 🛡️ Middleware for Route Protectionn

Next.js middleware protects authenticated routes:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token

  // Path the user is trying to access
  const path = req.nextUrl.pathname

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/reset-password']
  const isPublicRoute = publicRoutes.includes(path) ||
                        path.startsWith('/api/auth/') ||
                        path.includes('.')  // Static files

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicRoute) {
    const url = new URL('/auth/login', req.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && path.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    // Apply middleware to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],

`````tex

## 🔄 Authentication Componentstss

### Login Form Component

```tsx
// src/components/auth/LoginForm.tsx
"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginValues) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-500">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <a
          href="/auth/reset-password"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
      >
        Sign In
      </Button>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => signIn('github', { callbackUrl })}
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => signIn('google', { callbackUrl })}
          >
            Google
          </Button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </a>
        </p>
      </div>
    </form>
  )

```````t
### Auth Pages Implementationiononn

```tsx
// src/pages/auth/login.tsx
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { authOptions } from '@/lib/auth/auth-options'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  return {
    props: {},

```text
`
## 🔄 Session Managementmententnt

### Client-Side Session Access

```tsx
// Example of client component with session access
"use client"

import { useSession } from 'next-auth/react'

export function ProfileButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <button>Sign In</button>
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full"
        />
      )}
      <span>{session.user.name}</span>
    </div>

```}
### Server-Side Session Accessccesscessess

```tsx
// Example of server component with session access
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}</p>
      {/* Dashboard content */}
    </div>
  )

## 🔒 Security Best Practicescticestices


1. **Environment Variables**
   - Store all secrets in environment variables
   - Use .env.local for local development
   - Configure proper environment variables in deployment environment

   ```text
   # .env.example
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-at-least-32-chars

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # OAuth Providers
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```text


1. **CSRF Protection**
   - NextAuth.js includes CSRF protection by default
   - Ensure secure cookie settings in production

1. **Input Validation**
   - Validate all user inputs with Zod
   - Sanitize data before processing

2. **Password Security**
   - Leverage Supabase's secure password hashing
   - Implement password strength requirements
   - Support secure password reset flows

1. **Session Expiry**
   - Set appropriate session timeouts
   - Implement refresh token rotation
   - Allow users to manage active sessions

## 🧪 Testing Authentication

1. **Unit Tests**
   - Test form validation logic
   - Test UI components with mocked authentication state

1. **Integration Tests**
   - Test authentication flows
   - Test protected route redirects

2. **End-to-End Tests**
   - Test complete sign-in flow with Playwright
   - Test sign-up and email verification

## 📝 Implementation Checklist

- [ ] Configure NextAuth with Supabase provider
- [ ] Implement login page and form
- [ ] Implement registration page and form
- [ ] Create password reset functionality
- [ ] Set up route protection middleware
- [ ] Implement session management
- [ ] Add social authentication providers
- [ ] Create user profile management
- [ ] Test all authentication flows
- [ ] Secure environment variables
- [ ] Document authentication routes and behaviors

---

This authentication module provides a comprehensive framework for implementing secure, user-friendly authentication in the SolnAI application. Follow these guidelines to ensure a robust authentication system.
