import { run, fail } from "../runtime";

export default async function preChecks() {
  const res = await run("npm run doctor", { timeoutMs: 120_000 });
  if (!res.ok) {
    fail("Dr. Cursored health check failed. Fix before scaffolding.");
  }
}
