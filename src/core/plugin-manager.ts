import { ProjectContext, ScaffoldPlugin } from '../types';
import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';
import Handlebars from 'handlebars';

export class PluginManager {
  private readonly plugins: Map<string, ScaffoldPlugin> = new Map();

  constructor() {
    this.registerBuiltinPlugins();
  }

  async installPlugins(context: ProjectContext): Promise<void> {
    const pluginsToInstall = this.getPluginsForContext(context);
    
    for (const pluginName of pluginsToInstall) {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        console.warn(`Plugin ${pluginName} not found`);
        continue;
      }

      await this.installPlugin(context, plugin);
    }
  }

  private getPluginsForContext(context: ProjectContext): string[] {
    const plugins: string[] = [];

    // Database plugins
    if (context.database) {
      plugins.push(`database-${context.database}`);
    }

    // Auth plugins
    if (context.authProvider) {
      plugins.push(`auth-${context.authProvider}`);
    }

    // Testing plugins
    if (context.testingFramework) {
      plugins.push(`testing-${context.testingFramework}`);
    }

    // State management plugins
    if (context.stateManagement) {
      plugins.push(`state-${context.stateManagement}`);
    }

    // Framework-specific plugins
    if (context.framework) {
      plugins.push(`framework-${context.framework}`);
    }

    // Quality and tooling plugins
    plugins.push('quality-husky', 'quality-eslint', 'tooling-prettier');

    return plugins;
  }

  private async installPlugin(context: ProjectContext, plugin: ScaffoldPlugin): Promise<void> {
    try {
      // Run pre-generation hook
      if (plugin.hooks.preGen) {
        await plugin.hooks.preGen(context);
      }

      // Generate plugin files
      for (const file of plugin.files) {
        if (file.condition && !file.condition(context)) {
          continue;
        }

        await this.generatePluginFile(context, file);
      }

      // Run post-generation hook
      if (plugin.hooks.postGen) {
        await plugin.hooks.postGen(context);
      }

      console.log(`✅ Installed plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Failed to install plugin ${plugin.name}:`, error);
    }
  }

  private async generatePluginFile(context: ProjectContext, file: any): Promise<void> {
    const filePath = join(context.path, file.path);
    await ensureDir(join(filePath, '..'));

    let content = file.content;
    
    // If it's a template, compile it with context
    if (file.template) {
      const template = Handlebars.compile(content);
      content = template(context);
    }

    await writeFile(filePath, content);

    // Make executable if needed
    if (file.executable) {
      // Note: In a real implementation, you'd use chmod here
      // This is a simplified version for cross-platform compatibility
    }
  }

  private registerBuiltinPlugins(): void {
    // Database plugins
    this.registerPlugin({
      name: 'database-supabase',
      version: '1.0.0',
      description: 'Supabase database integration',
      dependencies: ['@supabase/supabase-js', '@supabase/auth-helpers-nextjs'],
      files: [
        {
          path: 'src/lib/supabase.ts',
          content: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export async function getSupabaseClient() {
  return supabase
}

// Example query function
export async function getData(table: string) {
  const { data, error } = await supabase.from(table).select('*')
  
  if (error) {
    throw new Error(\`Database error: \${error.message}\`)
  }
  
  return data
}`
        },
        {
          path: '.env.example',
          content: `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
        }
      ],
      hooks: {
        preGen: async (context) => {
          // Add environment variables to package.json scripts
        },
        postGen: async (context) => {
          console.log('Supabase plugin installed - remember to set up your environment variables');
        }
      },
      aiInstructions: 'Use the supabase client from src/lib/supabase.ts for all database operations'
    });

    this.registerPlugin({
      name: 'database-prisma',
      version: '1.0.0',
      description: 'Prisma ORM integration',
      dependencies: ['@prisma/client', 'prisma'],
      files: [
        {
          path: 'prisma/schema.prisma',
          content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}`
        },
        {
          path: 'src/lib/prisma.ts',
          content: `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma`
        },
        {
          path: '.env.example',
          content: `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/{{name}}?schema=public"`
        }
      ],
      hooks: {
        postGen: async (context) => {
          console.log('Prisma plugin installed - run "npx prisma generate" to generate the client');
        }
      },
      aiInstructions: 'Use the prisma client from src/lib/prisma.ts for all database operations. Run migrations with "npx prisma migrate dev"'
    });

    // Auth plugins
    this.registerPlugin({
      name: 'auth-supabase-auth',
      version: '1.0.0',
      description: 'Supabase authentication',
      dependencies: ['@supabase/auth-helpers-nextjs'],
      files: [
        {
          path: 'src/lib/auth.ts',
          content: `import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

export async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUser(req, res)
  
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  
  return user
}`
        }
      ],
      hooks: {},
      aiInstructions: 'Use the auth helpers from src/lib/auth.ts for authentication. Check user authentication in API routes.'
    });

    this.registerPlugin({
      name: 'auth-clerk',
      version: '1.0.0',
      description: 'Clerk authentication',
      dependencies: ['@clerk/nextjs'],
      files: [
        {
          path: '.env.example',
          content: `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key`
        }
      ],
      hooks: {},
      aiInstructions: 'Use Clerk hooks and components for authentication. Wrap your app with ClerkProvider.'
    });

    // Testing plugins
    this.registerPlugin({
      name: 'testing-vitest',
      version: '1.0.0',
      description: 'Vitest testing framework',
      dependencies: ['vitest', '@vitest/coverage-v8'],
      files: [
        {
          path: '__tests__/example.test.ts',
          content: `import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })
})`
        }
      ],
      hooks: {},
      aiInstructions: 'Write tests using Vitest. Place test files next to source files with .test.ts extension.'
    });

    this.registerPlugin({
      name: 'testing-jest',
      version: '1.0.0',
      description: 'Jest testing framework',
      dependencies: ['jest', '@types/jest', 'ts-jest'],
      files: [
        {
          path: 'jest.config.js',
          content: `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
}`
        }
      ],
      hooks: {},
      aiInstructions: 'Write tests using Jest. Use describe/it blocks and Jest matchers.'
    });

    // State management plugins
    this.registerPlugin({
      name: 'state-zustand',
      version: '1.0.0',
      description: 'Zustand state management',
      dependencies: ['zustand'],
      files: [
        {
          path: 'src/store/useStore.ts',
          content: `import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface StoreState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'app-store',
    }
  )
)`
        }
      ],
      hooks: {},
      aiInstructions: 'Use Zustand stores for state management. Create stores in src/store/ and import them in components.'
    });

    this.registerPlugin({
      name: 'state-redux',
      version: '1.0.0',
      description: 'Redux Toolkit state management',
      dependencies: ['@reduxjs/toolkit', 'react-redux'],
      files: [
        {
          path: 'src/store/index.ts',
          content: `import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch`
        },
        {
          path: 'src/store/hooks.ts',
          content: `import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector`
        }
      ],
      hooks: {},
      aiInstructions: 'Use Redux Toolkit for state management. Create slices in src/store/features/ and use typed hooks.'
    });

    // Quality plugins
    this.registerPlugin({
      name: 'quality-husky',
      version: '1.0.0',
      description: 'Husky git hooks',
      dependencies: ['husky', 'lint-staged'],
      files: [
        {
          path: '.husky/pre-commit',
          content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged`,
          executable: true
        }
      ],
      hooks: {
        postGen: async (context) => {
          console.log('Husky installed - git hooks will run quality checks on commit');
        }
      },
      aiInstructions: 'Quality checks run automatically on git commit. Fix any issues before committing.'
    });

    this.registerPlugin({
      name: 'quality-eslint',
      version: '1.0.0',
      description: 'ESLint code quality',
      dependencies: ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'],
      files: [],
      hooks: {},
      aiInstructions: 'Follow ESLint rules for code quality. Run "npm run lint:fix" to auto-fix issues.'
    });

    this.registerPlugin({
      name: 'tooling-prettier',
      version: '1.0.0',
      description: 'Prettier code formatting',
      dependencies: ['prettier'],
      files: [],
      hooks: {},
      aiInstructions: 'Code is automatically formatted with Prettier. Use consistent formatting.'
    });
  }

  private registerPlugin(plugin: ScaffoldPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  async addPlugin(pluginName: string, context: ProjectContext): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    await this.installPlugin(context, plugin);
  }

  getAvailablePlugins(): ScaffoldPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(name: string): ScaffoldPlugin | undefined {
    return this.plugins.get(name);
  }
}
