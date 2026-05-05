// One-shot recorder: opens the live demo in headless Chromium, records 6 s of
// video, converts to a palette-optimised GIF via ffmpeg.
//
// Run: node assets/record-showcase.mjs
// Output: assets/showcase.gif

import { chromium } from "/Users/phyrex/Documents/git/phyrextsai/ascii-canvas/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.env.RECORD_URL || "https://phyrextsai.github.io/ascii-canvas/demo/";
const W = 900;
const H = 760;
const SECONDS = 6;
const FPS = 18;
const OUT = "assets/showcase.gif";

const tmp = mkdtempSync(join(tmpdir(), "ac-rec-"));
console.log(`recording ${URL} → ${tmp}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  recordVideo: { dir: tmp, size: { width: W, height: H } },
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(SECONDS * 1000);
await page.close();
await ctx.close();
await browser.close();

const webm = readdirSync(tmp).find((f) => f.endsWith(".webm"));
if (!webm) {
  console.error("no .webm produced");
  process.exit(1);
}
const webmPath = join(tmp, webm);
const palette = join(tmp, "palette.png");

console.log("generating palette");
execFileSync("ffmpeg", [
  "-y", "-i", webmPath,
  "-vf", `fps=${FPS},scale=${W}:-1:flags=lanczos,palettegen=stats_mode=diff`,
  palette,
], { stdio: "inherit" });

console.log(`converting → ${OUT}`);
execFileSync("ffmpeg", [
  "-y", "-i", webmPath, "-i", palette,
  "-lavfi", `fps=${FPS},scale=${W}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
  OUT,
], { stdio: "inherit" });

rmSync(tmp, { recursive: true, force: true });
console.log("✓ done");
