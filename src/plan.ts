import * as fs from "node:fs/promises";
import * as path from "node:path";
import { writeFileAtomic } from "./runtime";

export type Step =
  | { kind: "ensure"; targetType: "dir" | "file"; path: string; contents?: string }
  | { kind: "add"; path: string; contents: string; ifMissing?: boolean }
  | { kind: "patch"; path: string; insertAfter?: string; insertBefore?: string; append?: string }
  | { kind: "run"; cmd: string };

export type Plan = { id: string; steps: Step[] };

export async function apply(
  plan: Plan, 
  exec: (cmd: string) => Promise<{ ok: boolean; stdout: string; stderr: string }>
) {
  const audit: any[] = [];
  
  for (const s of plan.steps) {
    if (s.kind === "ensure") {
      if (s.targetType === "dir") {
        await fs.mkdir(s.path, { recursive: true });
      } else {
        try { 
          await fs.access(s.path); 
        } catch { 
          await writeFileAtomic(s.path, s.contents ?? ""); 
        }
      }
      audit.push({ kind: s.kind, path: s.path });
    }
    
    if (s.kind === "add") {
      if (s.ifMissing) {
        try { 
          await fs.access(s.path); 
          continue; 
        } catch { 
          /* proceed */ 
        }
      }
      await writeFileAtomic(s.path, s.contents);
      audit.push({ kind: s.kind, path: s.path });
    }
    
    if (s.kind === "patch") {
      const raw = await fs.readFile(s.path, "utf8");
      let out = raw;
      
      if (s.insertAfter && raw.includes(s.insertAfter)) {
        const idx = raw.indexOf(s.insertAfter) + s.insertAfter.length;
        out = raw.slice(0, idx) + (s.append ?? "") + raw.slice(idx);
      } else if (s.insertBefore && raw.includes(s.insertBefore)) {
        const idx = raw.indexOf(s.insertBefore);
        out = raw.slice(0, idx) + (s.append ?? "") + raw.slice(idx);
      } else if (s.append) {
        out = raw + s.append;
      }
      
      if (out !== raw) await writeFileAtomic(s.path, out);
      audit.push({ kind: s.kind, path: s.path });
    }
    
    if (s.kind === "run") {
      const r = await exec(s.cmd);
      audit.push({ kind: s.kind, cmd: s.cmd, ok: r.ok });
      if (!r.ok) throw new Error(`Command failed: ${s.cmd}`);
    }
  }
  
  return { ok: true, audit };
}
