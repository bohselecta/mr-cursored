# 🧱 **mr-cursored** — AI‑Optimized Project Scaffolder

A protocol + CLI that turns high‑level intents into a repeatable, AI‑friendly project skeleton with strong guardrails and first‑class hooks for Dr./Nurse/Prof/Guard/Crew.

## 🔭 Goals

* **Deterministic scaffolds** that AI agents can reliably extend
* **Composable rules**: base → stack preset → project overrides → session tweaks
* **Zero‑mystery DX**: every generated file is documented inline, with reason + rollback
* **Health‑first**: hard dependency on `dr-cursored` checks, with pre/post hooks
* **Org‑ready**: security presets, authoring provenance, and team workflows baked in

## 📦 Install & Entry Points

```bash
npm i -D mr-cursored
npx mr-cursored init
npx mr-cursored plan:crud --name=Post --path=app/posts
npx mr-cursored audit:list
npx mr-cursored revert <audit-id>
```

## 🗂️ Repo Layout (generated)

```
./
├─ .mr/
│  ├─ config.json
│  ├─ profiles/
│  ├─ agents.md
│  ├─ cursorrules.*.md
│  ├─ recipes/
│  ├─ hooks/
│  └─ audit/
├─ .cursorrules
├─ AGENTS.md
├─ .dr-cursored.json
├─ .nurse.cursored.yml
├─ .guard.cursored.yml
├─ .prof.cursored.md
└─ package.json
```

## 🧩 Config Schema

The project uses a Zod schema for type-safe configuration:

```typescript
import { z } from "zod";

export const Schema = z.object({
  projectName: z.string().min(1),
  stack: z.object({
    preset: z.enum(["web/next-ts", "web/vite-react-ts", "node/express-ts"]).default("web/next-ts"),
    features: z.array(z.enum(["auth", "testing", "e2e", "lint", "format", "env", "docker"]).optional()).default([]),
    style: z.object({ 
      ui: z.enum(["tailwind", "shadcn"]).default("tailwind"), 
      theme: z.enum(["dark", "light", "system"]).default("system") 
    })
  }),
  ai: z.object({
    goals: z.array(z.string()).default([]),
    boundaries: z.array(z.string()).default([]),
    context: z.object({ 
      domain: z.string().default(""), 
      constraints: z.array(z.string()).default([]), 
      docs: z.array(z.string()).default([]) 
    }).default({ domain: "", constraints: [], docs: [] }),
    conventions: z.object({ 
      commitStyle: z.enum(["conventional", "gitmoji", "none"]).default("conventional"), 
      codeStyle: z.string().default("prettier+eslint+typescript-strict") 
    }).default({ 
      commitStyle: "conventional", 
      codeStyle: "prettier+eslint+typescript-strict" 
    })
  }).default({ 
    goals: [], 
    boundaries: [], 
    context: { domain: "", constraints: [], docs: [] }, 
    conventions: { commitStyle: "conventional", codeStyle: "prettier+eslint+typescript-strict" } 
  }),
  guards: z.object({
    license: z.enum(["MIT", "Apache-2.0", "BUSL", "Proprietary"]).default("MIT"),
    secrets: z.object({ 
      denyPatterns: z.array(z.string()).default([]), 
      providers: z.array(z.string()).default([]) 
    }).default({ denyPatterns: [], providers: [] }),
    compliance: z.array(z.string()).default([])
  }).default({ 
    license: "MIT", 
    secrets: { denyPatterns: [], providers: [] }, 
    compliance: [] 
  }),
  integrations: z.object({
    ci: z.enum(["github-actions", "none"]).default("github-actions"),
    hosting: z.enum(["vercel", "fly", "render", "docker-local"]).default("vercel"),
    analytics: z.enum(["none", "posthog", "plausible"]).default("none")
  }).default({ 
    ci: "github-actions", 
    hosting: "vercel", 
    analytics: "none" 
  })
});
```

## 🤖 `agents.md` (source)

```markdown
# Agents

## Architect
- Outputs: .cursorrules, layout, CODEOWNERS
- Deterministic files, idempotent reruns

## Implementer
- Apply recipes with small diffs (<200 LOC)
- Diff rationale required in PR

## Reviewer
- Lint, test, security scan
- Reject on secrets, missing tests, bundle bloat

## Operator
- Verify deployability, rollbacks, runbooks
```

## 🧠 `.cursorrules` (compiled)

```markdown
# Cursor Rules
- Atomic diffs only
- Run `npm run doctor` before/after
- No secrets; stub to .env.example
- Diff <200 LOC
```

## 🧪 v0 Code Skeletons

### Core Runtime

The `runtime.ts` provides utilities for executing shell commands, handling errors, and atomic file operations:

```typescript
import { execa } from "execa";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function run(cmd: string) {
  const [bin, ...args] = cmd.split(" ");
  const { exitCode, stdout, stderr } = await execa(bin, args);
  return { ok: exitCode === 0, stdout, stderr };
}

export async function writeFileAtomic(p: string, data: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  const tmp = path.join(path.dirname(p), ".#" + path.basename(p));
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, p);
}
```

### Plan Engine

The `plan.ts` defines the core plan execution system with `ensure`, `add`, `patch`, and `run` operations:

```typescript
export type Step =
  | { kind: "ensure"; targetType: "dir" | "file"; path: string; contents?: string }
  | { kind: "add"; path: string; contents: string; ifMissing?: boolean }
  | { kind: "patch"; path: string; insertAfter?: string; insertBefore?: string; append?: string }
  | { kind: "run"; cmd: string };

export type Plan = { id: string; steps: Step[] };
```

## 🧾 Audit + ♻️ Revert + ▶️ Replay

The audit system provides complete traceability and reversibility:

```typescript
export type FileSnapshot = {
  path: string;
  existed: boolean;
  beforeHash?: string; // sha256 of previous contents
  afterHash?: string;  // sha256 of new contents
  before?: string;     // stored inline for small files (<= 256 KB)
  after?: string;      // stored inline for small files (<= 256 KB)
};

export type AuditRecord = {
  id: string;               // e.g. web/crud-2025-09-13T19-55-00Z
  planId: string;           // recipe id or freeform label
  startedAt: string;        // ISO timestamp
  finishedAt?: string;      // ISO timestamp
  steps: Array<{
    kind: "ensure" | "add" | "patch" | "run";
    path?: string;
    cmd?: string;
    snapshot?: FileSnapshot;
    note?: string;
    ok: boolean;
  }>;
  ok?: boolean;
};
```

## 📦 Recipes

### CRUD Recipe

The CRUD recipe generates a complete CRUD feature with Zod validation, Next.js API routes, and Vitest tests:

```typescript
export async function buildCrudPlan({ name, path }: { name: string; path: string }): Promise<Plan> {
  const lc = name.charAt(0).toLowerCase() + name.slice(1);
  const steps: Step[] = [
    { kind: "ensure", targetType: "dir", path: "src/lib/db" },
    { kind: "add", path: `src/lib/db/${lc}.ts`, ifMissing: true, contents: `...` },
    { kind: "add", path: `${path}/page.tsx`, ifMissing: true, contents: `...` },
    { kind: "add", path: `app/api/${lc}/route.ts`, contents: `...` },
    { kind: "add", path: `src/__tests__/api/${lc}/route.test.ts`, contents: `...` },
    { kind: "run", cmd: "npm run lint:fix" }
  ];
  return { id: `web/crud/${lc}`, steps };
}
```

## 🚀 Usage Examples

### Basic Setup

```bash
# Initialize mr-cursored in your project
npx mr-cursored init

# Generate a CRUD feature for Posts
npx mr-cursored plan:crud Post app/posts

# List all audit records
npx mr-cursored audit:list

# Revert a specific operation
npx mr-cursored revert web/crud/post-2025-01-15T10-30-00Z
```

### Advanced Usage

```bash
# Generate CRUD for Users with custom path
npx mr-cursored plan:crud User app/admin/users

# Check what operations have been performed
npx mr-cursored audit:list

# Revert the last operation
npx mr-cursored revert $(npx mr-cursored audit:list | tail -1)
```

## 🧯 Safety Rails

The system includes comprehensive safety measures:

1. **Atomic File Operations**: All file writes use temporary files and atomic renames
2. **Audit Trail**: Every operation is recorded with before/after snapshots
3. **Reversible Operations**: Any operation can be reverted using the audit trail
4. **Health Checks**: Pre-operation validation ensures system integrity
5. **Type Safety**: Zod schemas ensure configuration validity

## 🧭 Next Steps

* **Database Integration**: Add Drizzle ORM recipes for SQLite and LibSQL/Turso
* **Authentication**: Create auth recipes with session management
* **Testing**: Expand test generation with comprehensive coverage
* **CI/CD**: Add GitHub Actions workflows for automated testing
* **Documentation**: Generate comprehensive project documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/bohselecta/mr-cursored/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bohselecta/mr-cursored/discussions)

---

**Built with ❤️ for the AI-assisted development community**