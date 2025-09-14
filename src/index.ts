#!/usr/bin/env node

import { applyWithAudit } from "./plan.audit";
import { revert as revertAudit, list as listAudits } from "./audit";
import { buildCrudPlan } from "./recipes/buildCrudPlan";
import { run } from "./runtime";

async function main() {
  const cmd = process.argv[2];
  
  if (cmd === "audit:list") {
    console.log((await listAudits()).join("\n"));
    return;
  }
  
  if (cmd === "revert") {
    const id = process.argv[3];
    if (!id) { 
      console.error("Usage: mr-cursored revert <audit-id>"); 
      process.exit(1); 
    }
    await revertAudit(id); 
    console.log(`Reverted ${id}`); 
    return;
  }
  
  if (cmd === "plan:crud") {
    const name = process.argv[3] || "Post";
    const path = process.argv[4] || "app/posts";
    
    const plan = await buildCrudPlan({ name, path });
    const res = await applyWithAudit(plan);
    console.log(JSON.stringify(res, null, 2));
    return;
  }
  
  if (cmd === "init") {
    console.log("Initializing mr-cursored project...");
    
    // Create .mr directory structure
    const { ensureDir } = await import("./runtime");
    await ensureDir(".mr/recipes");
    await ensureDir(".mr/hooks");
    await ensureDir(".mr/audit");
    await ensureDir(".mr/profiles");
    
    console.log("✅ mr-cursored initialized successfully!");
    console.log("Run 'mr-cursored plan:crud' to create your first CRUD feature.");
    return;
  }
  
  console.log("🧱 mr-cursored — AI-Optimized Project Scaffolder");
  console.log("");
  console.log("Commands:");
  console.log("  init                    Initialize mr-cursored in current directory");
  console.log("  plan:crud [name] [path] Generate CRUD feature (default: Post, app/posts)");
  console.log("  audit:list              List all audit records");
  console.log("  revert <id>             Revert changes from audit record");
  console.log("");
  console.log("Examples:");
  console.log("  mr-cursored init");
  console.log("  mr-cursored plan:crud User app/users");
  console.log("  mr-cursored audit:list");
  console.log("  mr-cursored revert web/crud/post-2025-01-15T10-30-00Z");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
