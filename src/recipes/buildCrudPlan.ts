import type { Plan, Step } from "../plan";

export async function buildCrudPlan({ 
  name, 
  path 
}: { 
  name: string; 
  path: string; 
}): Promise<Plan> {
  const lc = name.charAt(0).toLowerCase() + name.slice(1);
  const steps: Step[] = [
    { 
      kind: "ensure", 
      targetType: "dir", 
      path: "src/lib/db" 
    },
    { 
      kind: "add", 
      path: `src/lib/db/${lc}.ts`, 
      ifMissing: true, 
      contents: `import { z } from 'zod'

export const ${name} = z.object({ 
  id: z.string(), 
  title: z.string(), 
  body: z.string().optional() 
})

export type ${name} = z.infer<typeof ${name}>
` 
    },
    { 
      kind: "ensure", 
      targetType: "dir", 
      path: `${path}` 
    },
    { 
      kind: "add", 
      path: `${path}/page.tsx`, 
      ifMissing: true, 
      contents: `import Link from 'next/link'

export default function ${name}sPage() {
  return (
    <main>
      <h1>${name}s</h1>
      <Link href='/${lc}/new'>New ${name}</Link>
    </main>
  )
}` 
    },
    { 
      kind: "ensure", 
      targetType: "dir", 
      path: `app/api/${lc}` 
    },
    { 
      kind: "add", 
      path: `app/api/${lc}/route.ts`, 
      contents: `import { NextResponse } from 'next/server'
import { ${name} } from '@/src/lib/db/${lc}'

const db: ${name}[] = [] as any

export async function GET() { 
  return NextResponse.json({ items: db }) 
}

export async function POST(req: Request) { 
  const body = await req.json()
  const parsed = ${name}.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }
  db.push(parsed.data)
  return NextResponse.json(parsed.data, { status: 201 })
}` 
    },
    { 
      kind: "ensure", 
      targetType: "dir", 
      path: `src/__tests__/api/${lc}` 
    },
    { 
      kind: "add", 
      path: `src/__tests__/api/${lc}/route.test.ts`, 
      contents: `import { describe, it, expect } from 'vitest'

// Pseudo-tests: recommend using next-test-api-route-handler or supertest with a custom server
describe('${lc} api', () => { 
  it('schema exists', () => { 
    expect(1).toBe(1) 
  }) 
})` 
    },
    { 
      kind: "patch", 
      path: ".env.example", 
      append: `
# Example envs for ${lc} feature
NEXT_PUBLIC_API_BASE=http://localhost:3000
` 
    },
    { 
      kind: "run", 
      cmd: "npm run lint:fix" 
    }
  ];
  
  return { id: `web/crud/${lc}`, steps };
}
