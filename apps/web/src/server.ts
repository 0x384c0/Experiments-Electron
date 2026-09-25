import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(__dirname, "..");
const PORT = 3000;

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
};

http
  .createServer((req, res) => {
    const filePath = req.url === "/" ? "/index.html" : req.url ?? "/index.html";
    const fullPath = path.join(ROOT, filePath);
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(fullPath)] ?? "text/plain" });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`web app on http://localhost:${PORT}`);
  });
