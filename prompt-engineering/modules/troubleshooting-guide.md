# SolnAI Troubleshooting and Architecture Guide

## Overview

This guide provides troubleshooting strategies for common implementation issues and visual architecture diagrams to better understand component relationships in the SolnAI application.

## Troubleshooting Guide

Reference: [SOLNAI:TROUBLESHOOTING]

### Common Next.js Issues

#### 1. "Error: Hydration failed because the initial UI does not match what was rendered on the server"

**Symptoms:**

- Error message in console about hydration mismatch
- UI elements flashing or changing after initial render

**Possible Causes:**

- Using browser-only APIs (like `window` or `localStorage`) during server rendering
- Different content rendered on server vs. client
- Dynamic content that depends on client-side state

**Solutions:**

- Use `useEffect` for browser-only API calls
- Add `'use client'` directive to components using client-side APIs
- Use dynamic imports with `{ ssr: false }` option
- Use the `useClient` hook to detect client-side rendering

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ClientSideComponent() {
  const [windowWidth, setWindowWidth] = useState(0);
  
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>Window width: {windowWidth}px</div>;
}
```

#### 2. "Error: Cannot find module '@/components/...'"

**Symptoms:**

- Import error despite the file existing
- Path aliases not resolving correctly

**Solutions:**

- Verify path aliases in `tsconfig.json` and `jsconfig.json`
- Check that the file is in the correct location
- Restart the development server
- Clear Next.js cache with `rm -rf .next` and restart

#### 3. "Error: The 'src' property is invalid in server components"

**Symptoms:**

- Error when using `next/image` in server components

**Solutions:**

- Verify image is stored in the correct public directory
- Use proper path format for image sources
- For remote images, add domains to `next.config.js`

```js
// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
  },
};
```

### State Management Issues

#### 1. "State updates not reflecting in UI"

**Symptoms:**

- UI not updating after state changes
- Inconsistent state across components

**Possible Causes:**

- Direct mutation of state objects in Zustand
- Missing dependencies in React hooks
- React Query cache issues

**Solutions:**

- Use immer or spread syntax for Zustand state updates
- Check hook dependencies
- Invalidate React Query cache when needed

```tsx
// Incorrect Zustand update (mutating state)
set((state) => {
  state.user.name = 'New Name'; // ❌ Direct mutation
  return state;
});

// Correct Zustand update (creating new state)
set((state) => ({
  ...state,
  user: {
    ...state.user,
    name: 'New Name', // ✅ Creating new object
  },
}));
```

#### 2. "React Query stale data issues"

**Symptoms:**

- Data not refreshing when expected
- Stale data displayed after mutations

**Solutions:**

- Configure proper `staleTime` and `cacheTime`
- Use `invalidateQueries` after mutations
- Implement proper query keys structure

```tsx
// After mutation, invalidate related queries
mutation.mutate(newData, {
  onSuccess: () => {
    queryClient.invalidateQueries(['projects']);
    // Also invalidate more specific queries
    queryClient.invalidateQueries(['projects', projectId]);
  },
});
```

### API Integration Issues

#### 1. "CORS errors when calling API"

**Symptoms:**

- Console errors about CORS policy
- API requests failing in browser but working in Postman

**Solutions:**

- Use Next.js API routes as a proxy
- Configure CORS headers on the server
- Use the correct API URL for each environment

#### 2. "tRPC type errors"

**Symptoms:**

- TypeScript errors related to tRPC procedures
- Missing or invalid types in tRPC calls

**Solutions:**

- Run code generation command to update types
- Check input validation schemas
- Verify procedure definitions match client usage

```bash
# Regenerate tRPC types
pnpm type-check
```

### Authentication Issues

#### 1. "Session not persisting after refresh"

**Symptoms:**

- User logged out after page refresh
- Auth state inconsistent between pages

**Solutions:**

- Verify NextAuth.js session configuration
- Check cookie settings
- Ensure proper session provider setup

```tsx
// In _app.tsx or layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
```

#### 2. "Protected routes accessible to unauthenticated users"

**Symptoms:**

- Unauthenticated users can access protected content
- Redirect loops in authentication flow

**Solutions:**

- Verify middleware configuration
- Check auth guard implementation
- Ensure proper session checking logic

## Architecture Diagrams

Reference: [SOLNAI:ARCHITECTURE-DIAGRAMS]

### Application Architecture Overview

```
┌─────────────────────────────────────┐
│              Browser                │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│            Next.js App              │
│  ┌─────────────────────────────┐    │
│  │       React Components       │    │
│  │  ┌───────────┐ ┌──────────┐ │    │
│  │  │   Pages   │ │ Layouts  │ │    │
│  │  └───────────┘ └──────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        State Management     │    │
│  │  ┌───────────┐ ┌──────────┐ │    │
│  │  │  Zustand  │ │TanStack Q│ │    │
│  │  └───────────┘ └──────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │            API Layer        │    │
│  │  ┌───────────┐ ┌──────────┐ │    │
│  │  │   tRPC    │ │Next-Auth │ │    │
│  │  └───────────┘ └──────────┘ │    │
│  └─────────────────────────────┘    │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│             Database                │
│  ┌─────────────────────────────┐    │
│  │           Supabase          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Component Relationship Diagram

```
┌───────────────────────────────────────────────────────────┐
│                       App Layout                          │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Header     │  │   Main       │  │   Footer     │    │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬┘    │
│         │                 │                        │      │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────────▼┐    │
│  │   Nav        │  │   Page       │  │   Social    │    │
│  │   Component  │  │   Content    │  │   Links     │    │
│  └──────────────┘  └──────┬───────┘  └─────────────┘    │
│                           │                              │
│                    ┌──────▼───────┐                      │
│                    │  Feature     │                      │
│                    │  Components  │                      │
│                    └──────┬───────┘                      │
│                           │                              │
│                    ┌──────▼───────┐                      │
│                    │   UI         │                      │
│                    │   Components │                      │
│                    └──────────────┘                      │
└───────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  UI Events  │───►  │   Zustand   │ ◄─── │  API Hooks  │
│  (Actions)  │      │   Store     │      │  (Queries)  │
└─────────────┘      └──────┬──────┘      └──────▲──────┘
                            │                    │
                            ▼                    │
                     ┌────────────┐      ┌──────┴──────┐
                     │            │      │             │
                     │ Components │◄─────┤   tRPC API  │
                     │            │      │             │
                     └────────────┘      └──────┬──────┘
                                                │
                                         ┌──────▼──────┐
                                         │             │
                                         │  Database   │
                                         │             │
                                         └─────────────┘
```

## Development Workflow

### Standard Development Process

1. **Planning Phase**
   - Understand requirements thoroughly
   - Break down tasks into manageable components
   - Identify dependencies and potential challenges
   - Define acceptance criteria

2. **Setup Phase**
   - Create feature branch from main

   ```bash
   git checkout -b feature/your-feature-name
   ```

   - Set up environment variables if needed
   - Install any new dependencies required

   ```bash
   pnpm add package-name@version
   ```

3. **Implementation Phase**
   - Follow component architecture patterns
   - Start with types and interfaces
   - Build UI components
   - Implement business logic
   - Connect to API/state management
   - Regular commits with descriptive messages

   ```bash
   git commit -m "feat: implement feature-name component"
   ```

4. **Testing Phase**
   - Write unit tests for components
   - Run test suite

   ```bash
   pnpm test
   ```

   - Perform manual testing
   - Verify accessibility compliance
   - Address any issues found

5. **Review Phase**
   - Create pull request with comprehensive description
   - Respond to code review comments
   - Make necessary adjustments
   - Ensure CI/CD pipeline passes

6. **Deployment Phase**
   - Merge to main after approval
   - Monitor deployment process
   - Verify feature in staging/production
   - Document any deployment-specific instructions

### Handling Feature Conflicts

If multiple developers are working on overlapping features:

1. Communicate early and often about your changes
2. Keep PRs small and focused
3. Rebase your branch frequently to incorporate latest changes

```bash
git fetch origin
git rebase origin/main
```

4. Resolve conflicts carefully, preserving intent of both changes
5. Consider pair programming for complex integration points

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

- Project initialization
- Core UI components
- Base layout structure
- Style system implementation
- Authentication foundation

### Phase 2: Core Features (Weeks 3-4)

- User management
- Project creation/management
- Document handling
- Basic AI integration
- Data persistence

### Phase 3: Advanced Features (Weeks 5-6)

- Advanced AI capabilities
- Analytics dashboard
- Collaboration features
- Notification system
- Integration with external services

### Phase 4: Optimization (Weeks 7-8)

- Performance improvements
- Accessibility refinements
- SEO optimization
- Testing coverage expansion
- Documentation completion

### Phase 5: Launch Preparation (Weeks 9-10)

- User acceptance testing
- Bug fixing
- Final optimizations
- Deployment pipeline refinement
- Launch preparations
