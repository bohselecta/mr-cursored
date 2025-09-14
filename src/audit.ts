import * as fs from "node:fs/promises";
import * as path from "node:path";
import crypto from "node:crypto";

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

const AUDIT_DIR = ".mr/audit";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

async function safeRead(p: string) {
  try { 
    return await fs.readFile(p, "utf8"); 
  } catch { 
    return undefined; 
  }
}

export async function begin(planId: string): Promise<AuditRecord> {
  const now = new Date().toISOString().replace(/[:]/g, "-");
  const id = `${planId}-${now}`;
  await fs.mkdir(AUDIT_DIR, { recursive: true });
  const rec: AuditRecord = { 
    id, 
    planId, 
    startedAt: new Date().toISOString(), 
    steps: [] 
  };
  await fs.writeFile(
    path.join(AUDIT_DIR, `${id}.json`), 
    JSON.stringify(rec, null, 2)
  );
  return rec;
}

export async function record(rec: AuditRecord, step: AuditRecord["steps"][number]) {
  rec.steps.push(step);
  await fs.writeFile(
    path.join(AUDIT_DIR, `${rec.id}.json`), 
    JSON.stringify(rec, null, 2)
  );
}

export async function finalize(rec: AuditRecord, ok: boolean) {
  rec.ok = ok;
  rec.finishedAt = new Date().toISOString();
  await fs.writeFile(
    path.join(AUDIT_DIR, `${rec.id}.json`), 
    JSON.stringify(rec, null, 2)
  );
}

export async function snapshotFile(p: string, afterContent?: string): Promise<FileSnapshot> {
  const before = await safeRead(p);
  const existed = before !== undefined;
  const snap: FileSnapshot = {
    path: p,
    existed,
    beforeHash: before ? sha256(before) : undefined,
    afterHash: afterContent !== undefined ? sha256(afterContent) : undefined,
    before: before && before.length <= 262144 ? before : undefined,
    after: afterContent && afterContent.length <= 262144 ? afterContent : undefined
  };
  return snap;
}

export async function revert(auditId: string) {
  const p = path.join(AUDIT_DIR, `${auditId}.json`);
  const raw = await fs.readFile(p, "utf8");
  const rec = JSON.parse(raw) as AuditRecord;
  
  // Walk steps in reverse and undo file mutations.
  for (let i = rec.steps.length - 1; i >= 0; i--) {
    const s = rec.steps[i];
    if (!s.snapshot) continue;
    const snap = s.snapshot;
    
    if (!snap.existed) {
      // File was created by the plan: remove it if it still matches the after hash (or force delete if unknown).
      try { 
        await fs.unlink(snap.path); 
      } catch { 
        /* ignore */ 
      }
    } else {
      // File existed before: restore its previous contents when we have them.
      if (typeof snap.before === "string") {
        await fs.writeFile(snap.path, snap.before, "utf8");
      }
    }
  }
}

export async function list() {
  try {
    const files = await fs.readdir(AUDIT_DIR);
    return files
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(/\.json$/, ""));
  } catch { 
    return []; 
  }
}
