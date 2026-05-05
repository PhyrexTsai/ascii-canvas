import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const BUDGET = 8000; // bytes, gzipped
const distDir = "dist";

const jsFiles = readdirSync(distDir).filter((f) => f.endsWith(".js"));
let total = 0;
const breakdown = [];
for (const f of jsFiles) {
  const raw = readFileSync(join(distDir, f));
  const gz = gzipSync(raw).length;
  total += gz;
  breakdown.push(`  ${f}: ${gz} B`);
}

console.log(`gzipped total: ${total} B (budget ${BUDGET} B)`);
breakdown.forEach((l) => console.log(l));

if (total > BUDGET) {
  console.error(`✗ over budget by ${total - BUDGET} B`);
  process.exit(1);
}
console.log("✓ within budget");
