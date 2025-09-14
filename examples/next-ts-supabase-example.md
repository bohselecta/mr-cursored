# Next.js TypeScript with Supabase Example

This example demonstrates how to use AI Scaffold to create a Next.js application with TypeScript and Supabase integration.

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (free tier available)

## Quick Start

```bash
# Create new project
ai-scaffold create my-next-app --stack next-ts-supabase

# Navigate to project
cd my-next-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## What Gets Generated

### Project Structure
```
my-next-app/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # Reusable components
│   ├── lib/             # Utilities
│   │   └── supabase.ts  # Supabase client
│   ├── types/           # TypeScript definitions
│   └── hooks/           # Custom React hooks
├── .cursorrules         # Cursor AI configuration
├── AGENTS.md           # AI development guidelines
├── .github/            # CI/CD workflows
└── package.json        # Dependencies
```

### Key Features

#### AI Configuration
- **Cursor Rules**: Project-specific AI guidelines
- **Copilot Context**: Optimized for Next.js and Supabase
- **Claude Instructions**: Comprehensive project context

#### Quality Gates
- TypeScript strict mode
- ESLint and Prettier
- Pre-commit hooks
- CI/CD pipeline
- Test coverage

#### Supabase Integration
- Pre-configured Supabase client
- Authentication helpers
- Database utilities
- Type-safe queries

## Development Workflow

### 1. Set Up Supabase
```bash
# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Use AI Tools
```bash
# Cursor will use project-specific rules
# Copilot will suggest Next.js patterns
# Claude will understand your architecture
```

### 3. Add Features
```bash
# Add authentication
ai-scaffold add auth --type supabase-auth

# Add testing
ai-scold add testing --type vitest

# Add state management
ai-scaffold add state --type zustand
```

### 4. Quality Checks
```bash
# Run all quality checks
npm run quality

# Check project health
ai-scaffold health

# AI-assisted code review
ai-scaffold review
```

## Example Components

### Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getData(table: string) {
  const { data, error } = await supabase.from(table).select('*')
  
  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }
  
  return data
}
```

### Example Page Component
```typescript
// src/app/page.tsx
import { getData } from '@/lib/supabase'

export default async function HomePage() {
  const data = await getData('users')
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">
          Welcome to My Next App
        </h1>
      </div>
      
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Users{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            {data?.length || 0} users found
          </p>
        </div>
      </div>
    </main>
  )
}
```

## AI Development Tips

### With Cursor
- Use the `.cursorrules` file for project context
- Reference the `AGENTS.md` for guidelines
- Follow the established patterns in `/lib`

### With Copilot
- Copilot understands Next.js patterns
- Use descriptive function names
- Include TypeScript types

### With Claude
- Reference the project architecture in `AGENTS.md`
- Ask for database query optimizations
- Request component refactoring suggestions

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Next Steps

1. **Set up your Supabase project**
2. **Configure authentication**
3. **Create your database schema**
4. **Build your features using AI tools**
5. **Deploy to production**

## Troubleshooting

### Common Issues
- **Type errors**: Run `npm run typecheck`
- **Build errors**: Check environment variables
- **Supabase connection**: Verify credentials

### Getting Help
- Check the generated `AGENTS.md` file
- Use `ai-scaffold health` to diagnose issues
- Review the project documentation

---

*This example was generated by AI Scaffold - the ultimate pre-flight tool for AI development!*
