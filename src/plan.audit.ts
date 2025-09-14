import * as fs from "node:fs/promises";
import { apply, type Plan, type Step } from "./plan";
import { begin, record, finalize, snapshotFile, type AuditRecord } from "./audit";
import { run } from "./runtime";

export async function applyWithAudit(plan: Plan) {
  const audit = await begin(plan.id);
  
  try {
    // wrap exec to record run steps
    const exec = async (cmd: string) => {
      const res = await run(cmd);
      await record(audit, { kind: "run", cmd, ok: res.ok });
      return { ok: res.ok, stdout: res.stdout, stderr: res.stderr };
    };

    // monkey-patch file operations by mirroring plan.apply loop
    for (const s of plan.steps) {
      if (s.kind === "run") { 
        await exec(s.cmd); 
        continue; 
      }
      
      const path = (s as any).path as string;
      let afterContent: string | undefined;
      
      if (s.kind === "add") afterContent = s.contents;
      if (s.kind === "patch") {
        const raw = await fs.readFile(path, "utf8");
        const append = (s as any).append ?? "";
        afterContent = raw + append; // trust plan.patch to decide final content; this is a best‑effort snapshot
      }
      
      const snap = await snapshotFile(path, afterContent);

      // delegate the actual work to vanilla apply by building a tiny sub-plan with one step
      await apply({ id: `${plan.id}:sub`, steps: [s] }, async (c) => exec(c));

      await record(audit, { kind: s.kind as any, path, snapshot: snap, ok: true });
    }

    await finalize(audit, true);
    return { ok: true, auditId: audit.id };
  } catch (e) {
    await finalize(audit, false);
    throw e;
  }
}

export async function replay(auditId: string) {
  // For v0, replay means re-running the same plan id if available.
  // Advanced mode can serialize the exact steps into the audit file.
  throw new Error("Replay v0: serialize plans into audit to enable exact replays (todo)");
}
