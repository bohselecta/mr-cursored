import { readFile, pathExists, readdir } from 'fs-extra';
import { join } from 'path';
import { ProjectContext, StackTemplate } from '../types';

export class StackDetector {
  private readonly packageFiles = ['package.json', 'yarn.lock', 'pnpm-lock.yaml', 'package-lock.json'];
  private readonly configFiles = [
    'tsconfig.json', 'jsconfig.json', 'next.config.js', 'next.config.ts',
    'vite.config.js', 'vite.config.ts', 'webpack.config.js', 'tailwind.config.js',
    'nuxt.config.js', 'nuxt.config.ts', 'svelte.config.js', 'astro.config.mjs',
    'angular.json', 'vue.config.js', 'remix.config.js', 'turbopack.config.js'
  ];

  async detectExistingProject(projectPath: string): Promise<Partial<ProjectContext> | null> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      
      if (!(await pathExists(packageJsonPath))) {
        return null;
      }

      const packageJson = await readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(packageJson);
      
      const context: Partial<ProjectContext> = {
        name: pkg.name || 'unknown',
        description: pkg.description,
        path: projectPath,
        packageManager: await this.detectPackageManager(projectPath),
        aiTools: []
      };

      // Detect framework
      context.framework = this.detectFramework(pkg);
      context.stack = this.determineStack(context.framework, pkg);
      
      // Detect additional tools
      context.database = this.detectDatabase(pkg);
      context.authProvider = this.detectAuthProvider(pkg);
      context.stateManagement = this.detectStateManagement(pkg);
      context.testingFramework = this.detectTestingFramework(pkg);

      return context;
    } catch (error) {
      return null;
    }
  }

  private async detectPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm'> {
    if (await pathExists(join(projectPath, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (await pathExists(join(projectPath, 'yarn.lock'))) {
      return 'yarn';
    }
    return 'npm';
  }

  private detectFramework(pkg: any): string {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.next) return 'next';
    if (deps.nuxt) return 'nuxt';
    if (deps.svelte) return 'svelte';
    if (deps.astro) return 'astro';
    if (deps['@angular/core']) return 'angular';
    if (deps.vue && deps['@vue/cli-service']) return 'vue-cli';
    if (deps.vite && deps.vue) return 'vite-vue';
    if (deps.remix) return 'remix';
    if (deps.gatsby) return 'gatsby';
    if (deps['@solidjs/start']) return 'solid-start';
    if (deps.react && !deps.next && !deps.gatsby) return 'react';
    if (deps.vue && !deps.nuxt) return 'vue';
    if (deps.svelte && !deps.astro) return 'svelte';
    
    return 'vanilla';
  }

  private determineStack(framework: string, pkg: any): string {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const isTypeScript = deps.typescript || pkg.devDependencies?.['@types/node'];
    
    const stackMap: Record<string, string> = {
      'next': isTypeScript ? 'next-ts' : 'next-js',
      'nuxt': isTypeScript ? 'nuxt-ts' : 'nuxt-js',
      'svelte': isTypeScript ? 'svelte-ts' : 'svelte-js',
      'astro': isTypeScript ? 'astro-ts' : 'astro-js',
      'angular': 'angular-ts',
      'vue-cli': isTypeScript ? 'vue-ts' : 'vue-js',
      'vite-vue': isTypeScript ? 'vite-vue-ts' : 'vite-vue-js',
      'remix': isTypeScript ? 'remix-ts' : 'remix-js',
      'gatsby': isTypeScript ? 'gatsby-ts' : 'gatsby-js',
      'solid-start': isTypeScript ? 'solid-ts' : 'solid-js',
      'react': isTypeScript ? 'react-ts' : 'react-js',
      'vue': isTypeScript ? 'vue-ts' : 'vue-js',
      'vanilla': isTypeScript ? 'vanilla-ts' : 'vanilla-js'
    };

    return stackMap[framework] || 'unknown';
  }

  private detectDatabase(pkg: any): string | undefined {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps['@supabase/supabase-js']) return 'supabase';
    if (deps['@prisma/client']) return 'prisma';
    if (deps.mongoose) return 'mongodb';
    if (deps.typeorm) return 'typeorm';
    if (deps.sequelize) return 'sequelize';
    if (deps['pg'] || deps['mysql2'] || deps.sqlite3) return 'sql';
    if (deps.firebase) return 'firebase';
    if (deps['@planetscale/database']) return 'planetscale';
    
    return undefined;
  }

  private detectAuthProvider(pkg: any): string | undefined {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps['@clerk/nextjs'] || deps['@clerk/react']) return 'clerk';
    if (deps['@auth0/nextjs-auth0']) return 'auth0';
    if (deps['next-auth']) return 'nextauth';
    if (deps['@supabase/auth-helpers-nextjs']) return 'supabase-auth';
    if (deps['@firebase/auth']) return 'firebase-auth';
    if (deps['@okta/okta-react']) return 'okta';
    
    return undefined;
  }

  private detectStateManagement(pkg: any): string | undefined {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.redux || deps['@reduxjs/toolkit']) return 'redux';
    if (deps.zustand) return 'zustand';
    if (deps.jotai) return 'jotai';
    if (deps.recoil) return 'recoil';
    if (deps.mobx) return 'mobx';
    if (deps['@tanstack/react-query']) return 'tanstack-query';
    if (deps.swr) return 'swr';
    if (deps.apollo) return 'apollo';
    if (deps.relay) return 'relay';
    
    return undefined;
  }

  private detectTestingFramework(pkg: any): string | undefined {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps.vitest) return 'vitest';
    if (deps.jest) return 'jest';
    if (deps['@testing-library/react']) return 'testing-library';
    if (deps.cypress) return 'cypress';
    if (deps.playwright) return 'playwright';
    if (deps.puppeteer) return 'puppeteer';
    if (deps.mocha) return 'mocha';
    if (deps.ava) return 'ava';
    
    return undefined;
  }

  async getAvailableStacks(): Promise<StackTemplate[]> {
    // This would typically load from a templates directory
    // For now, returning predefined stacks
    return [
      {
        name: 'next-ts-supabase',
        description: 'Next.js TypeScript with Supabase - Full-stack app optimized for AI development',
        tags: ['frontend', 'fullstack', 'typescript', 'supabase'],
        aiCompatibility: ['cursor', 'copilot', 'claude'],
        structure: [
          'src/',
          'src/components/',
          'src/lib/',
          'src/types/',
          'src/hooks/',
          'src/utils/',
          '__tests__/',
          'docs/'
        ],
        dependencies: {
          dev: ['typescript', '@types/node', 'eslint', 'prettier', '@typescript-eslint/eslint-plugin'],
          runtime: ['next', 'react', '@supabase/supabase-js', '@supabase/auth-helpers-nextjs']
        },
        aiSetup: {
          cursorRules: true,
          agentsMd: true,
          contextFiles: ['src/lib/', 'src/types/', 'src/components/']
        },
        qualityGates: [
          {
            name: 'Type Check',
            command: 'npm run typecheck',
            required: true,
            description: 'TypeScript type checking'
          },
          {
            name: 'Lint',
            command: 'npm run lint',
            required: true,
            description: 'ESLint code quality check'
          },
          {
            name: 'Test',
            command: 'npm run test',
            required: true,
            description: 'Unit and integration tests'
          }
        ],
        devTools: [
          {
            name: 'postgres',
            type: 'container',
            config: {
              image: 'postgres:15',
              ports: ['5432:5432'],
              environment: {
                POSTGRES_DB: 'myapp',
                POSTGRES_USER: 'postgres',
                POSTGRES_PASSWORD: 'postgres'
              }
            }
          }
        ],
        plugins: ['database-supabase', 'auth-supabase', 'testing-vitest']
      }
    ];
  }
}
