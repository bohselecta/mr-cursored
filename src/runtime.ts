import { execa } from "execa";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export type CmdResult = { 
  ok: boolean; 
  code: number; 
  stdout: string; 
  stderr: string; 
};

export async function run(
  cmd: string, 
  opts: { cwd?: string; timeoutMs?: number } = {}
): Promise<CmdResult> {
  const [bin, ...args] = cmd.split(" ");
  try {
    const p = execa(bin, args, { 
      cwd: opts.cwd, 
      timeout: opts.timeoutMs ?? 0 
    });
    const { exitCode, stdout, stderr } = await p;
    return { 
      ok: exitCode === 0, 
      code: exitCode ?? 0, 
      stdout, 
      stderr 
    };
  } catch (err: any) {
    return { 
      ok: false, 
      code: err.exitCode ?? 1, 
      stdout: err.stdout ?? "", 
      stderr: err.stderr ?? String(err) 
    };
  }
}

export function fail(message: string): never {
  throw new Error(`mr-cursored: ${message}`);
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function readJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeFileAtomic(p: string, data: string) {
  const dir = path.dirname(p);
  await ensureDir(dir);
  const tmp = path.join(dir, ".#" + path.basename(p) + ".tmp");
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, p);
}
