# SolnAI API Integration Implementation Guide

## Overview

This guide provides a comprehensive approach to implementing API integration in the SolnAI Next.js application. It covers the setup of a type-safe API client using tRPC, data fetching patterns, error handling, and optimistic updates. The focus is on creating a maintainable and performant API layer that seamlessly integrates with the application's state management.

## API Architecture

The SolnAI application uses a layered API architecture:

1. **tRPC Backend**: Type-safe API routes implemented with tRPC
2. **API Client**: A centralized client for making API requests
3. **Data Fetching Hooks**: Custom hooks using TanStack Query for data fetching
4. **Mutation Hooks**: Custom hooks for data modification operations

## File Structure

```
src/
├── server/
│   ├── api/
│   │   ├── routers/                  # tRPC routers
│   │   │   ├── auth.ts               # Authentication routes
│   │   │   ├── projects.ts           # Project management routes
│   │   │   ├── documents.ts          # Document management routes
│   │   │   └── users.ts              # User management routes
│   │   ├── trpc.ts                   # tRPC initialization
│   │   └── root.ts                   # Root router configuration
│   └── db/
│       └── index.ts                  # Database client
├── lib/
│   └── api/
│       ├── client.ts                 # API client configuration
│       ├── types.ts                  # API type definitions
│       └── utils.ts                  # API utility functions
├── app/
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts          # tRPC HTTP handler
└── hooks/
    └── api/
        ├── queries/                  # Data fetching hooks
        │   ├── useProjects.ts        # Project query hooks
        │   ├── useDocuments.ts       # Document query hooks
        │   └── useUser.ts            # User query hooks
        └── mutations/                # Data mutation hooks
            ├── useCreateProject.ts   # Create project mutation
            ├── useUpdateDocument.ts  # Update document mutation
            └── useDeleteItem.ts      # Delete item mutation
```

## Implementation Guide

### 1. tRPC Server Setup

First, set up the tRPC server with proper procedure builders:

```typescript
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { getServerSession } from 'next-auth';
import { prisma } from '../db';
import { authOptions } from '@/lib/auth/auth-options';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authOptions);

  return {
    prisma,
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

// Create reusable procedure builders
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - only for authenticated users
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  })
);

// Admin procedure - only for admin users
export const adminProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user || ctx.session.user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  })
);
```

### 2. Creating API Routers

Create domain-specific routers using Zod for input validation:

```typescript
// src/server/api/routers/projects.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Input validation schema
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const projectsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: { documents: true },
      });
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      // Verify ownership
      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to access this project',
        });
      }
      
      return project;
    }),

  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          ...input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Verify ownership before update
      const project = await ctx.prisma.project.findUnique({
        where: { id },
      });
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this project',
        });
      }
      
      return ctx.prisma.project.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before delete
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
      });
      
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }
      
      if (project.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this project',
        });
      }
      
      return ctx.prisma.project.delete({
        where: { id: input.id },
      });
    }),
});
```

### 3. Root Router Configuration

Combine all domain routers into a root router:

```typescript
// src/server/api/root.ts
import { router } from "./trpc";
import { projectsRouter } from "./routers/projects";
import { documentsRouter } from "./routers/documents";
import { usersRouter } from "./routers/users";
import { authRouter } from "./routers/auth";

export const appRouter = router({
  projects: projectsRouter,
  documents: documentsRouter,
  users: usersRouter,
  auth: authRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
```

### 4. tRPC HTTP Handler Setup

Create the API route handler:

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };
```

### 5. API Client Setup

Create a client-side tRPC client:

```typescript
// src/lib/api/client.ts
import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Optional: include cookies when sending requests
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
```

### 6. tRPC Provider Setup

Set up the tRPC provider at the application root:

```typescript
// src/app/providers.tsx
'use client';

import { trpc, trpcClient, queryClient } from '@/lib/api/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => trpcClient);
  const [qClient] = useState(() => queryClient);

  return (
    <trpc.Provider client={client} queryClient={qClient}>
      <QueryClientProvider client={qClient}>
        {children}
        {process.env.NODE_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 7. Data Fetching Hooks

Create custom hooks for data fetching operations:

```typescript
// src/hooks/api/queries/useProjects.ts
import { trpc } from '@/lib/api/client';
import { useSession } from 'next-auth/react';

export const useProjects = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  
  return trpc.projects.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: string | undefined) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  
  return trpc.projects.getById.useQuery({ id: id! }, {
    enabled: isAuthenticated && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 8. Mutation Hooks

Create custom hooks for data modification operations:

```typescript
// src/hooks/api/mutations/useCreateProject.ts
import { trpc } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast'; // Assuming you have a Toast component

export const useCreateProject = () => {
  const utils = trpc.useContext();
  
  return trpc.projects.create.useMutation({
    onSuccess: async () => {
      // Invalidate query to refresh projects list
      await utils.projects.getAll.invalidate();
      toast({
        title: 'Success',
        description: 'Project created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });
};
```

### 9. Implementing Optimistic Updates

For a better user experience, implement optimistic updates:

```typescript
// src/hooks/api/mutations/useUpdateProject.ts
import { trpc } from '@/lib/api/client';
import { toast } from '@/components/ui/Toast';
import { Project } from '@/types';

export const useUpdateProject = () => {
  const utils = trpc.useContext();
  
  return trpc.projects.update.useMutation({
    // Optimistically update UI before the server responds
    onMutate: async (newProject) => {
      // Cancel outgoing refetches that might overwrite our optimistic update
      await utils.projects.getAll.cancel();
      
      // Save snapshot of previous data
      const previousProjects = utils.projects.getAll.getData();
      
      // Optimistically update the cache
      utils.projects.getAll.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((project) => 
          project.id === newProject.id ? { ...project, ...newProject } : project
        );
      });
      
      // If the project detail is in the cache, update it too
      utils.projects.getById.setData({ id: newProject.id }, (old) => {
        if (!old) return old;
        return { ...old, ...newProject };
      });
      
      // Return the snapshot for rollback in case of error
      return { previousProjects };
    },
    
    // If the mutation fails, roll back to the snapshot
    onError: (err, newProject, context) => {
      utils.projects.getAll.setData(undefined, context?.previousProjects);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
    
    // Always refetch after error or success to ensure consistency
    onSettled: async () => {
      await utils.projects.getAll.invalidate();
    },
    
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project updated successfully',
        variant: 'success',
      });
    },
  });
};
```

### 10. Error Handling

Implement consistent API error handling:

```typescript
// src/lib/api/utils.ts
import { TRPCClientError } from '@trpc/client';
import { toast } from '@/components/ui/Toast';

export interface ApiError {
  code: string;
  message: string;
  path?: string[];
}

export const formatApiError = (error: unknown): ApiError => {
  if (error instanceof TRPCClientError) {
    // Extract the error details from the TRPC error
    const trpcError = error.data;
    
    return {
      code: trpcError?.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unknown error occurred',
      path: trpcError?.path,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message || 'An unknown error occurred',
    };
  }
  
  return {
    code: 'UNKNOWN',
    message: 'An unknown error occurred',
  };
};

export const handleApiError = (error: unknown, fallbackMessage: string = 'An error occurred'): void => {
  const formatted = formatApiError(error);
  
  const errorCodes: Record<string, string> = {
    'UNAUTHORIZED': 'You need to sign in to access this resource',
    'FORBIDDEN': 'You don\'t have permission to access this resource',
    'NOT_FOUND': 'The requested resource was not found',
    'BAD_REQUEST': 'Invalid request data',
    'INTERNAL_SERVER_ERROR': 'Something went wrong on our end',
    'TIMEOUT': 'Request timed out',
  };
  
  toast({
    title: 'Error',
    description: errorCodes[formatted.code] || formatted.message || fallbackMessage,
    variant: 'destructive',
  });
  
  // You might want to log the error to a monitoring service
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', formatted);
  }
};
```

### 11. Data Prefetching (SSR Support)

Implement server-side prefetching for initial data loads:

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import superjson from 'superjson';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Dashboard from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Create server-side helpers
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      session,
      prisma: prisma,
    },
    transformer: superjson,
  });
  
  // Prefetch data
  await helpers.projects.getAll.prefetch();
  
  return (
    <div>
      {/* Pass the helpers to the client component */}
      <Dashboard trpcState={helpers.dehydrate()} />
    </div>
  );
}

// src/components/dashboard/DashboardContent.tsx
'use client';

import { useProjects } from '@/hooks/api/queries/useProjects';
import { Hydrate, dehydrate } from '@tanstack/react-query';
import { trpc } from '@/lib/api/client';

export default function Dashboard({ trpcState }: { trpcState: any }) {
  // Hydrate the client from the server-fetched data
  return (
    <Hydrate state={trpcState}>
      <DashboardContent />
    </Hydrate>
  );
}

function DashboardContent() {
  const { data: projects, isLoading, error } = useProjects();
  
  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects</div>;
  
  return (
    <div>
      <h1>Your Projects</h1>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 12. Rate Limiting and API Protection

Implement rate limiting for API routes:

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Create a new ratelimiter with Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
});

const handler = async (req: Request) => {
  // Get IP address for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  // Rate limit check
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({
        message: 'Too many requests',
        code: 'TOO_MANY_REQUESTS',
      }),
      { 
        status: 429, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
  
  // Proceed with the request if rate limit is not exceeded
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });
};

export { handler as GET, handler as POST };
```

## API Integration Patterns

### 1. Fetching Data in Components

```tsx
// src/components/features/ProjectList.tsx
'use client';

import { useProjects } from '@/hooks/api/queries/useProjects';
import { ProjectCard } from '@/components/ui/ProjectCard';

export function ProjectList() {
  const { data: projects, isLoading, error } = useProjects();
  
  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects: {error.message}</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.length === 0 ? (
        <div>No projects found. Create your first project!</div>
      ) : (
        projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      )}
    </div>
  );
}
```

### 2. Creating and Updating Data

```tsx
// src/components/features/CreateProjectForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProject } from '@/hooks/api/mutations/useCreateProject';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type FormValues = z.infer<typeof createProjectSchema>;

export function CreateProjectForm() {
  const { mutate, isLoading } = useCreateProject();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setError(null);
    mutate(data, {
      onSuccess: () => {
        reset();
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
      )}
      
      <Input
        label="Project Name"
        {...register('name')}
        error={errors.name?.message}
      />
      
      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
      />
      
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        Create Project
      </Button>
    </form>
  );
}
```

### 3. Infinite Loading

```tsx
// src/hooks/api/queries/useInfiniteDocuments.ts
import { trpc } from '@/lib/api/client';

export const useInfiniteDocuments = (projectId: string) => {
  return trpc.documents.getInfinite.useInfiniteQuery(
    { projectId, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};

// src/components/features/DocumentList.tsx
'use client';

import { useInfiniteDocuments } from '@/hooks/api/queries/useInfiniteDocuments';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { Button } from '@/components/ui/Button';

export function DocumentList({ projectId }: { projectId: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = 
    useInfiniteDocuments(projectId);
  
  const { ref, inView } = useInView();
  
  // Load more documents when the load more sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);
  
  if (isLoading) return <div>Loading documents...</div>;
  if (error) return <div>Error loading documents: {error.message}</div>;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {data?.pages.map((page) => 
          page.items.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))
        )}
      </div>
      
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="ghost"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </Button>
        </div>
      )}
      
      {!hasNextPage && data?.pages[0].items.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more documents to load
        </div>
      )}
    </div>
  );
}
```

## Testing API Integration

### 1. Unit Testing API Hooks

```typescript
// src/hooks/api/queries/__tests__/useProjects.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/test/utils/testWrapper';
import { useProjects } from '../useProjects';
import { trpc } from '@/lib/api/client';

// Mock the trpc query
vi.mock('@/lib/api/client', () => ({
  trpc: {
    projects: {
      getAll: {
        useQuery: vi.fn(),
      },
    },
    useContext: vi.fn(),
  },
}));

describe('useProjects', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return projects data when successful', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', description: 'Description 1' },
      { id: '2', name: 'Project 2', description: 'Description 2' },
    ];

    // Setup the mock return value
    (trpc.projects.getAll.useQuery as vi.Mock).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockProjects);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle loading state', async () => {
    // Setup the mock return value for loading state
    (trpc.projects.getAll.useQuery as vi.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    const mockError = new Error('Failed to fetch projects');
    
    // Setup the mock return value for error state
    (trpc.projects.getAll.useQuery as vi.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
```

### 2. Integration Testing API Routes

```typescript
// src/server/api/routers/__tests__/projects.test.ts
import { appRouter } from '../../root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { prisma } from '@/server/db';
import superjson from 'superjson';

// Mock Prisma client
vi.mock('@/server/db', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Projects Router', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const mockContext = {
    session: mockSession,
    prisma,
  };

  const caller = appRouter.createCaller(mockContext);

  it('should get all projects for the authenticated user', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', userId: 'user-1' },
      { id: '2', name: 'Project 2', userId: 'user-1' },
    ];

    (prisma.project.findMany as vi.Mock).mockResolvedValue(mockProjects);

    const result = await caller.projects.getAll();

    expect(result).toEqual(mockProjects);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should create a new project', async () => {
    const mockProject = {
      id: '1',
      name: 'New Project',
      description: 'Project description',
      userId: 'user-1',
    };

    (prisma.project.create as vi.Mock).mockResolvedValue(mockProject);

    const input = {
      name: 'New Project',
      description: 'Project description',
    };

    const result = await caller.projects.create(input);

    expect(result).toEqual(mockProject);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        ...input,
        user: {
          connect: {
            id: 'user-1',
          },
        },
      },
    });
  });
});
```

## API Security Best Practices

1. **Input Validation**
   - Use Zod for schema validation on all inputs
   - Validate data types, length constraints, and business rules
   - Sanitize user input to prevent injection attacks

2. **Authentication and Authorization**
   - Use middleware for route protection
   - Implement role-based access control
   - Verify resource ownership before operations

3. **Rate Limiting**
   - Implement rate limiting for API routes
   - Use different limits for different endpoints
   - Consider user roles for limit tiers

4. **Error Handling**
   - Return consistent error responses
   - Don't expose sensitive information in errors
   - Log detailed errors server-side only

5. **CORS Configuration**
   - Set up proper CORS headers
   - Limit allowed origins in production
   - Use strict CORS settings

## Implementation Checklist

- [ ] Set up tRPC server with procedure builders
- [ ] Create domain-specific routers with validation
- [ ] Configure root router and HTTP handler
- [ ] Set up client-side tRPC provider
- [ ] Create data fetching hooks for queries
- [ ] Create mutation hooks for data operations
- [ ] Implement optimistic updates
- [ ] Configure error handling utilities
- [ ] Set up SSR data prefetching
- [ ] Implement API security measures
- [ ] Add tests for API integration
- [ ] Document API endpoints and usage

---

This API integration module provides a comprehensive foundation for implementing type-safe, efficient API operations in the SolnAI application. By following these patterns, you'll create a maintainable API layer that integrates seamlessly with the application's state management and UI components.
