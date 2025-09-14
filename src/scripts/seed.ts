import { getDb } from "../lib/db/client";
import { posts } from "../lib/db/schema";

const db = getDb();

const sample = [
  { id: "p1", title: "Hello Glyphd", body: "First post seeded" },
  { id: "p2", title: "Agentic Scaffolds", body: "mr-cursored FTW" }
];

// upsert-ish simple seed
for (const p of sample) {
  try { 
    db.insert(posts).values(p).run?.() ?? (await db.insert(posts).values(p)); 
  } catch {
    // ignore if already exists
  }
}

console.log("Seeded", sample.length, "posts");
