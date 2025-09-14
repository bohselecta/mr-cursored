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

export type Config = z.infer<typeof Schema>;
