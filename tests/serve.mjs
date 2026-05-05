import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const PORT = Number(process.env.PORT) || 4321;
const ROOT = process.cwd();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let p = normalize(join(ROOT, urlPath === "/" ? "/demo/index.html" : urlPath));
    if (!p.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    const s = await stat(p).catch(() => null);
    if (s?.isDirectory()) p = join(p, "index.html");
    const buf = await readFile(p);
    const type = MIME[extname(p)] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(buf);
  } catch (err) {
    const code = err.code === "ENOENT" ? 404 : 500;
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.end(String(err.message));
  }
}).listen(PORT, () => {
  console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
