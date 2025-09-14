import { ProjectContext, TemplateFile } from '../types';
import { writeFile, ensureDir, copy } from 'fs-extra';
import { join } from 'path';
import Handlebars from 'handlebars';
import { glob } from 'glob';

export class TemplateGenerator {
  private readonly templatePath = join(__dirname, '..', '..', 'templates');

  async generateProject(context: ProjectContext): Promise<void> {
    // Generate package.json
    await this.generatePackageJson(context);
    
    // Generate TypeScript configuration
    await this.generateTypeScriptConfig(context);
    
    // Generate basic project structure
    await this.generateProjectStructure(context);
    
    // Generate framework-specific files
    await this.generateFrameworkFiles(context);
    
    // Generate development configuration
    await this.generateDevConfig(context);
  }

  private async generatePackageJson(context: ProjectContext): Promise<void> {
    const template = {
      name: context.name,
      version: '0.1.0',
      description: context.description || 'An AI-optimized application',
      private: true,
      scripts: this.generateScripts(context),
      dependencies: this.generateDependencies(context),
      devDependencies: this.generateDevDependencies(context),
      engines: {
        node: '>=18.0.0'
      },
      keywords: [
        'ai-optimized',
        context.framework,
        'typescript',
        'tailwind'
      ]
    };

    await writeFile(
      join(context.path, 'package.json'),
      JSON.stringify(template, null, 2)
    );
  }

  private generateScripts(context: ProjectContext): Record<string, string> {
    const baseScripts = {
      dev: this.getDevScript(context),
      build: this.getBuildScript(context),
      start: this.getStartScript(context),
      typecheck: 'tsc --noEmit',
      lint: 'eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0',
      'lint:fix': 'eslint . --ext .ts,.tsx --fix',
      test: 'vitest',
      'test:coverage': 'vitest --coverage',
      quality: 'npm run typecheck && npm run lint && npm run test',
      prepare: 'husky install'
    };

    // Add framework-specific scripts
    switch (context.framework) {
      case 'next':
        return {
          ...baseScripts,
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          export: 'next export'
        };
      case 'nuxt':
        return {
          ...baseScripts,
          dev: 'nuxt dev',
          build: 'nuxt build',
          start: 'nuxt start',
          generate: 'nuxt generate'
        };
      default:
        return baseScripts;
    }
  }

  private getDevScript(context: ProjectContext): string {
    switch (context.framework) {
      case 'next': return 'next dev';
      case 'nuxt': return 'nuxt dev';
      case 'vite': return 'vite';
      default: return 'tsx watch src/index.ts';
    }
  }

  private getBuildScript(context: ProjectContext): string {
    switch (context.framework) {
      case 'next': return 'next build';
      case 'nuxt': return 'nuxt build';
      case 'vite': return 'vite build';
      default: return 'tsc && node dist/index.js';
    }
  }

  private getStartScript(context: ProjectContext): string {
    switch (context.framework) {
      case 'next': return 'next start';
      case 'nuxt': return 'nuxt start';
      default: return 'node dist/index.js';
    }
  }

  private generateDependencies(context: ProjectContext): Record<string, string> {
    const baseDeps: Record<string, string> = {};
    
    // Framework dependencies
    switch (context.framework) {
      case 'next':
        Object.assign(baseDeps, {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        });
        break;
      case 'nuxt':
        Object.assign(baseDeps, {
          'nuxt': '^3.8.0',
          'vue': '^3.3.0'
        });
        break;
      case 'react':
        Object.assign(baseDeps, {
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        });
        break;
      case 'vue':
        Object.assign(baseDeps, {
          'vue': '^3.3.0'
        });
        break;
    }

    // Database dependencies
    if (context.database) {
      switch (context.database) {
        case 'supabase':
          Object.assign(baseDeps, {
            '@supabase/supabase-js': '^2.38.0',
            '@supabase/auth-helpers-nextjs': '^0.8.7'
          });
          break;
        case 'prisma':
          Object.assign(baseDeps, {
            '@prisma/client': '^5.7.0',
            'prisma': '^5.7.0'
          });
          break;
      }
    }

    // State management
    if (context.stateManagement) {
      switch (context.stateManagement) {
        case 'zustand':
          Object.assign(baseDeps, {
            'zustand': '^4.4.7'
          });
          break;
        case 'redux':
          Object.assign(baseDeps, {
            '@reduxjs/toolkit': '^2.0.1',
            'react-redux': '^9.0.4'
          });
          break;
      }
    }

    // UI dependencies
    Object.assign(baseDeps, {
      'tailwindcss': '^3.3.6',
      'clsx': '^2.0.0',
      'tailwind-merge': '^2.2.0'
    });

    return baseDeps;
  }

  private generateDevDependencies(context: ProjectContext): Record<string, string> {
    const baseDevDeps: Record<string, string> = {
      '@types/node': '^20.10.5',
      'typescript': '^5.3.3',
      'eslint': '^8.56.0',
      '@typescript-eslint/eslint-plugin': '^6.15.0',
      '@typescript-eslint/parser': '^6.15.0',
      'prettier': '^3.1.1',
      'vitest': '^1.1.0',
      '@vitest/coverage-v8': '^1.1.0',
      'husky': '^8.0.3',
      'lint-staged': '^15.2.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32'
    };

    // Framework-specific dev dependencies
    switch (context.framework) {
      case 'next':
        Object.assign(baseDevDeps, {
          '@types/react': '^18.2.45',
          '@types/react-dom': '^18.2.18',
          'eslint-config-next': '^14.0.4'
        });
        break;
      case 'nuxt':
        Object.assign(baseDevDeps, {
          '@nuxt/devtools': '^1.0.0'
        });
        break;
      case 'react':
        Object.assign(baseDevDeps, {
          '@types/react': '^18.2.45',
          '@types/react-dom': '^18.2.18',
          '@vitejs/plugin-react': '^4.2.1',
          'vite': '^5.0.10'
        });
        break;
      case 'vue':
        Object.assign(baseDevDeps, {
          '@vitejs/plugin-vue': '^4.5.2',
          'vite': '^5.0.10'
        });
        break;
    }

    return baseDevDeps;
  }

  private async generateTypeScriptConfig(context: ProjectContext): Promise<void> {
    const config = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: context.framework === 'next' ? 'esnext' : 'commonjs',
        moduleResolution: 'node',
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        allowJs: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        ...this.getFrameworkSpecificTSConfig(context)
      },
      include: this.getIncludePaths(context),
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    };

    await writeFile(
      join(context.path, 'tsconfig.json'),
      JSON.stringify(config, null, 2)
    );
  }

  private getFrameworkSpecificTSConfig(context: ProjectContext): Record<string, any> {
    switch (context.framework) {
      case 'next':
        return {
          module: 'esnext',
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: {
            '@/*': ['./src/*']
          }
        };
      case 'nuxt':
        return {
          module: 'esnext',
          jsx: 'preserve',
          paths: {
            '@/*': ['./src/*'],
            '~/*': ['./src/*']
          }
        };
      default:
        return {};
    }
  }

  private getIncludePaths(context: ProjectContext): string[] {
    const basePaths = ['src/**/*'];
    
    switch (context.framework) {
      case 'next':
        return [...basePaths, 'next-env.d.ts', '**/*.ts', '**/*.tsx'];
      case 'nuxt':
        return [...basePaths, 'nuxt.config.ts', '**/*.vue'];
      default:
        return basePaths;
    }
  }

  private async generateProjectStructure(context: ProjectContext): Promise<void> {
    const directories = [
      'src',
      'src/components',
      'src/lib',
      'src/types',
      'src/hooks',
      'src/utils',
      'src/styles',
      '__tests__',
      'docs',
      'public'
    ];

    for (const dir of directories) {
      await ensureDir(join(context.path, dir));
    }

    // Generate index files
    await this.generateIndexFiles(context);
  }

  private async generateIndexFiles(context: ProjectContext): Promise<void> {
    // Main entry point
    const mainEntry = this.getMainEntryContent(context);
    await writeFile(join(context.path, 'src', 'index.ts'), mainEntry);

    // Types index
    const typesIndex = `// Global type definitions
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// Add your global types here
`;

    await writeFile(join(context.path, 'src', 'types', 'index.ts'), typesIndex);

    // Utils index
    const utilsIndex = `// Utility functions
export * from './helpers';
export * from './validators';
`;

    await writeFile(join(context.path, 'src', 'utils', 'index.ts'), utilsIndex);

    // Components index
    const componentsIndex = `// Re-export all components
// export { Button } from './Button';
// export { Input } from './Input';

// Add your component exports here
`;

    await writeFile(join(context.path, 'src', 'components', 'index.ts'), componentsIndex);
  }

  private getMainEntryContent(context: ProjectContext): string {
    switch (context.framework) {
      case 'next':
        return `// Next.js app entry point
// This file is automatically handled by Next.js
`;

      case 'nuxt':
        return `// Nuxt app entry point
// This file is automatically handled by Nuxt
`;

      default:
        return `// Main application entry point
import { createApp } from './app';

async function main() {
  const app = await createApp();
  console.log(\`🚀 Application started successfully!\`);
}

main().catch(console.error);
`;
    }
  }

  private async generateFrameworkFiles(context: ProjectContext): Promise<void> {
    switch (context.framework) {
      case 'next':
        await this.generateNextFiles(context);
        break;
      case 'nuxt':
        await this.generateNuxtFiles(context);
        break;
      case 'vite':
        await this.generateViteFiles(context);
        break;
      default:
        await this.generateVanillaFiles(context);
    }
  }

  private async generateNextFiles(context: ProjectContext): Promise<void> {
    // Next.js config
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
`;

    await writeFile(join(context.path, 'next.config.js'), nextConfig);

    // Tailwind config
    await this.generateTailwindConfig(context);

    // PostCSS config
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    await writeFile(join(context.path, 'postcss.config.js'), postcssConfig);

    // App directory structure
    await ensureDir(join(context.path, 'src', 'app'));
    
    const layout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${context.name}',
  description: '${context.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`;

    await writeFile(join(context.path, 'src', 'app', 'layout.tsx'), layout);

    const page = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">
          Welcome to {context.name}
        </h1>
      </div>
    </main>
  )
}`;

    await writeFile(join(context.path, 'src', 'app', 'page.tsx'), page);

    // Global CSS
    const globalsCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`;

    await writeFile(join(context.path, 'src', 'app', 'globals.css'), globalsCSS);
  }

  private async generateTailwindConfig(context: ProjectContext): Promise<void> {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}`;

    await writeFile(join(context.path, 'tailwind.config.js'), tailwindConfig);
  }

  private async generateNuxtFiles(context: ProjectContext): Promise<void> {
    // Nuxt config
    const nuxtConfig = `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    typeCheck: true
  }
})`;

    await writeFile(join(context.path, 'nuxt.config.ts'), nuxtConfig);
  }

  private async generateViteFiles(context: ProjectContext): Promise<void> {
    // Vite config
    const viteConfig = `import { defineConfig } from 'vite'
${context.framework === 'react' ? "import react from '@vitejs/plugin-react'" : ''}
${context.framework === 'vue' ? "import vue from '@vitejs/plugin-vue'" : ''}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [${context.framework === 'react' ? 'react()' : context.framework === 'vue' ? 'vue()' : ''}],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`;

    await writeFile(join(context.path, 'vite.config.ts'), viteConfig);
  }

  private async generateVanillaFiles(context: ProjectContext): Promise<void> {
    // Basic HTML file
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${context.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

    await writeFile(join(context.path, 'index.html'), indexHtml);
  }

  private async generateDevConfig(context: ProjectContext): Promise<void> {
    // ESLint config
    const eslintConfig = `{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    ${context.framework === 'next' ? '"next/core-web-vitals"' : ''}
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "root": true,
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}`;

    await writeFile(join(context.path, '.eslintrc.json'), eslintConfig);

    // Prettier config
    const prettierConfig = `{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}`;

    await writeFile(join(context.path, '.prettierrc'), prettierConfig);

    // Vitest config
    const vitestConfig = `import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})`;

    await writeFile(join(context.path, 'vitest.config.ts'), vitestConfig);

    // Husky config
    const huskyPreCommit = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run quality`;

    await ensureDir(join(context.path, '.husky'));
    await writeFile(join(context.path, '.husky', 'pre-commit'), huskyPreCommit);

    // Lint-staged config
    const lintStagedConfig = `{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}`;

    await writeFile(join(context.path, '.lintstagedrc'), lintStagedConfig);
  }
}
