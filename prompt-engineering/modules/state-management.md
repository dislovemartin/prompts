# SolnAI State Management Implementation Guide

## Overview

This guide provides a comprehensive approach to implementing state management in the SolnAI application using Zustand for global state and TanStack Query for server state. The implementation follows a domain-driven design approach, organizing state by feature while maintaining type safety and optimized performance.

## State Management Architecture

The SolnAI application uses a hybrid state management approach:

1. **Zustand**: For client-side global state management
2. **TanStack Query**: For server state and data fetching
3. **React Context**: For localized UI state
4. **Local Component State**: For component-specific states

## File Structure

```
src/
├── lib/
│   └── store/
│       ├── index.ts                  # Store exports
│       ├── slices/                   # Store slices by domain
│       │   ├── authSlice.ts          # Authentication state
│       │   ├── uiSlice.ts            # UI state (theme, sidebar, etc.)
│       │   ├── projectSlice.ts       # Project-related state
│       │   └── aiSlice.ts            # AI-related state
│       ├── middleware/               # Custom store middleware
│       │   ├── logger.ts             # Logging middleware
│       │   └── persistence.ts        # State persistence middleware
│       └── selectors/                # Reusable state selectors
│           ├── authSelectors.ts      # Authentication selectors
│           └── projectSelectors.ts   # Project selectors
├── api/
│   ├── hooks/                       # TanStack Query hooks
│   │   ├── useProjects.ts           # Projects query hooks
│   │   ├── useDocuments.ts          # Documents query hooks
│   │   └── useUser.ts               # User query hooks
│   ├── mutations/                   # Mutation hooks
│   │   ├── useCreateProject.ts      # Create project mutation
│   │   └── useUpdateDocument.ts     # Update document mutation
│   └── queryClient.ts               # TanStack Query client setup
└── hooks/
    └── state/                       # Custom state hooks
        ├── useTheme.ts              # Theme state hook
        ├── useAuthState.ts          # Auth state hook
        └── useProjectState.ts       # Project state hook
```

## Implementation Guide

### 1. Zustand Store Setup

First, set up the core Zustand store structure:

```typescript
// src/lib/store/index.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createAuthSlice, AuthSlice } from './slices/authSlice'
import { createUISlice, UISlice } from './slices/uiSlice'
import { createProjectSlice, ProjectSlice } from './slices/projectSlice'
import { createAISlice, AISlice } from './slices/aiSlice'

export type StoreState = AuthSlice & UISlice & ProjectSlice & AISlice
export type StoreActions = AuthSlice['actions'] & UISlice['actions'] & 
                          ProjectSlice['actions'] & AISlice['actions']

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
      ...createProjectSlice(...a),
      ...createAISlice(...a),
    }),
    {
      name: 'solnai-store',
      partialize: (state) => ({
        auth: { user: state.auth.user },
        ui: { theme: state.ui.theme }
      }),
    }
  )
)
```

### 2. Creating a Store Slice

Here's how to implement a store slice using the authentication slice as an example:

```typescript
// src/lib/store/slices/authSlice.ts
import { StateCreator } from 'zustand'
import { StoreState } from '..'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  setUser: (user: User | null) => void
  setAuthenticated: (status: boolean) => void
  setLoading: (status: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export interface AuthSlice {
  auth: AuthState
  actions: AuthActions
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = (set) => ({
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  actions: {
    setUser: (user) => set((state) => ({ 
      auth: { ...state.auth, user, isAuthenticated: !!user } 
    })),
    setAuthenticated: (status) => set((state) => ({ 
      auth: { ...state.auth, isAuthenticated: status } 
    })),
    setLoading: (status) => set((state) => ({ 
      auth: { ...state.auth, isLoading: status } 
    })),
    setError: (error) => set((state) => ({ 
      auth: { ...state.auth, error } 
    })),
    logout: () => set((state) => ({ 
      auth: { ...state.auth, user: null, isAuthenticated: false } 
    })),
  },
})
```

### 3. Creating a Custom Hook for State Access

Create a custom hook to provide type-safe access to store slices:

```typescript
// src/hooks/state/useAuthState.ts
import { useStore } from '@/lib/store'

export const useAuthState = () => {
  const auth = useStore((state) => state.auth)
  const actions = useStore((state) => state.actions)
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    setUser: actions.setUser,
    setAuthenticated: actions.setAuthenticated,
    setLoading: actions.setLoading,
    setError: actions.setError,
    logout: actions.logout,
  }
}
```

### 4. TanStack Query Setup

Configure TanStack Query for server state management:

```typescript
// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

### 5. Creating Query Hooks

Implement query hooks for data fetching:

```typescript
// src/api/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '@/api/services/projectService'
import { useAuthState } from '@/hooks/state/useAuthState'

export const useProjects = () => {
  const { user } = useAuthState()
  
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(),
    enabled: !!user,
  })
}
```

### 6. Creating Mutation Hooks

Implement mutation hooks for data updates:

```typescript
// src/api/mutations/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject } from '@/api/services/projectService'
import { Project } from '@/types'

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (newProject: Omit<Project, 'id'>) => createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

### 7. Combining Zustand and TanStack Query

Example of combining global state and server state:

```typescript
// src/components/features/ProjectList.tsx
'use client'

import { useProjects } from '@/api/hooks/useProjects'
import { useProjectState } from '@/hooks/state/useProjectState'

export const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects()
  const { selectedProjectId, setSelectedProject } = useProjectState()
  
  if (isLoading) return <div>Loading projects...</div>
  if (error) return <div>Error loading projects</div>
  
  return (
    <div>
      <h2>Your Projects</h2>
      <ul>
        {projects?.map((project) => (
          <li 
            key={project.id}
            className={project.id === selectedProjectId ? 'selected' : ''}
            onClick={() => setSelectedProject(project.id)}
          >
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## State Management Best Practices

### Performance Optimization

1. **Selective Subscription**: Subscribe only to the parts of the state you need:
   ```typescript
   // Avoid
   const entireState = useStore()
   
   // Recommended
   const user = useStore(state => state.auth.user)
   ```

2. **Memoization**: Use memoization for complex selectors:
   ```typescript
   // src/lib/store/selectors/projectSelectors.ts
   import { StoreState } from '..'

   export const getActiveProjects = (state: StoreState) => 
     state.projects.items.filter(p => p.status === 'active')
   ```

3. **Middleware for Logging**: Implement logging middleware during development:
   ```typescript
   // src/lib/store/middleware/logger.ts
   import { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand'

   type Logger = <
     T,
     Mps extends [StoreMutatorIdentifier, unknown][] = [],
     Mcs extends [StoreMutatorIdentifier, unknown][] = []
   >(
     f: StateCreator<T, Mps, Mcs>,
     name?: string
   ) => StateCreator<T, Mps, Mcs>

   type LoggerImpl = <T>(
     f: StateCreator<T, [], []>,
     name?: string
   ) => StateCreator<T, [], []>

   const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
     const loggedSet: typeof set = (...a) => {
       console.log(`${name || 'store'} prev state:`, get())
       set(...a)
       console.log(`${name || 'store'} next state:`, get())
     }
     return f(loggedSet, get, store)
   }

   export const logger = loggerImpl as unknown as Logger
   ```

### Data Persistence

Implement data persistence for important state:

```typescript
// Enhanced persistence configuration
export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUISlice(...a),
      ...createProjectSlice(...a),
      ...createAISlice(...a),
    }),
    {
      name: 'solnai-store',
      partialize: (state) => ({
        auth: { user: state.auth.user },
        ui: { theme: state.ui.theme },
        // Do not persist temporary UI states like modal visibility
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          
          try {
            return JSON.parse(str)
          } catch (e) {
            console.error('Error parsing stored state', e)
            return null
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)
```

### Type Safety

Ensure type safety across the state management system:

```typescript
// src/types/index.ts
export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'completed'
  createdAt: string
  updatedAt: string
  ownerId: string
}

export interface Document {
  id: string
  title: string
  content: string
  projectId: string
  createdAt: string
  updatedAt: string
}
```

## Integration Examples

### 1. Theme Management

```typescript
// src/lib/store/slices/uiSlice.ts
export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
}

export interface UIActions {
  setTheme: (theme: UIState['theme']) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export interface UISlice {
  ui: UIState
  actions: UIActions
}

export const createUISlice: StateCreator<
  StoreState,
  [],
  [],
  UISlice
> = (set) => ({
  ui: {
    theme: 'system',
    sidebarOpen: true,
  },
  actions: {
    setTheme: (theme) => set((state) => ({ 
      ui: { ...state.ui, theme } 
    })),
    toggleSidebar: () => set((state) => ({ 
      ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } 
    })),
    setSidebarOpen: (open) => set((state) => ({ 
      ui: { ...state.ui, sidebarOpen: open } 
    })),
  },
})

// src/hooks/state/useTheme.ts
import { useStore } from '@/lib/store'
import { useEffect } from 'react'

export const useTheme = () => {
  const theme = useStore((state) => state.ui.theme)
  const setTheme = useStore((state) => state.actions.setTheme)
  
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous classes
    root.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])
  
  return { theme, setTheme }
}
```

### 2. Authentication State Management

```typescript
// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuthState } from '@/hooks/state/useAuthState'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const LoginForm = () => {
  const router = useRouter()
  const { setUser, setLoading, setError } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      
      if (result?.error) {
        setError(result.error)
        return
      }
      
      // Fetch user data after successful sign in
      const userResponse = await fetch('/api/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
        router.push('/dashboard')
      } else {
        setError('Failed to load user data')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

## Testing State Management

### 1. Testing Zustand Store

```typescript
// src/lib/store/__tests__/authSlice.test.ts
import { createAuthSlice } from '../slices/authSlice'

describe('Auth Slice', () => {
  const mockSet = jest.fn()
  const mockGet = jest.fn()
  const mockStore = { getState: jest.fn(), setState: jest.fn() }
  const authSlice = createAuthSlice(mockSet, mockGet, mockStore)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('initial state is correct', () => {
    expect(authSlice.auth).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  test('setUser updates user and authentication status', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }
    authSlice.actions.setUser(mockUser)
    
    expect(mockSet).toHaveBeenCalledWith(expect.any(Function))
    
    // Extract and call the function passed to mockSet
    const setStateFunction = mockSet.mock.calls[0][0]
    const newState = setStateFunction({ auth: authSlice.auth })
    
    expect(newState).toEqual({
      auth: {
        ...authSlice.auth,
        user: mockUser,
        isAuthenticated: true,
      },
    })
  })

  // More tests for other actions...
})
```

### 2. Testing TanStack Query Hooks

```typescript
// src/api/hooks/__tests__/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '../useProjects'
import { fetchProjects } from '@/api/services/projectService'
import { useAuthState } from '@/hooks/state/useAuthState'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/api/queryClient'

// Mock dependencies
jest.mock('@/api/services/projectService')
jest.mock('@/hooks/state/useAuthState')

const mockFetchProjects = fetchProjects as jest.MockedFunction<typeof fetchProjects>
const mockUseAuthState = useAuthState as jest.MockedFunction<typeof useAuthState>

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  test('fetches projects when user is authenticated', async () => {
    const mockProjects = [{ id: '1', name: 'Project 1' }]
    mockFetchProjects.mockResolvedValue(mockProjects)
    mockUseAuthState.mockReturnValue({ user: { id: 'user1' } } as any)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useProjects(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetchProjects).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(mockProjects)
  })

  test('does not fetch projects when user is not authenticated', async () => {
    mockUseAuthState.mockReturnValue({ user: null } as any)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useProjects(), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetchProjects).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})
```

## Implementation Checklist

- [ ] Set up Zustand core store structure
- [ ] Create and implement store slices for each domain
- [ ] Implement persistence middleware for critical state
- [ ] Set up TanStack Query client and provider
- [ ] Create query hooks for data fetching operations
- [ ] Create mutation hooks for data modification operations
- [ ] Develop custom hooks for accessing state with type safety
- [ ] Implement state selectors for derived state
- [ ] Add test coverage for state management
- [ ] Ensure proper state hydration to prevent hydration mismatches
- [ ] Document state management patterns for the project

## Conclusion

This state management architecture provides a robust foundation for the SolnAI application, combining the strengths of Zustand for client-side state and TanStack Query for server state. By following this implementation guide, you'll establish a scalable, type-safe, and performant state management system that can grow with the application's needs. 