const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const workspaceRoot = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8084);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = urlPath === "/" ? "/prompt-generator.html" : urlPath;
  let filePath;
  let allowedRoot = root;
  if (safePath === "/suno-generator.html") {
    filePath = path.join(root, "suno-generator.html");
  } else if (safePath === "/css/suno-generator.css") {
    filePath = path.join(root, "css", "suno-generator.css");
  } else if (safePath === "/js/suno-generator.js") {
    filePath = path.join(root, "js", "suno-generator.js");
  } else if (safePath.startsWith("/terrain-portrait-generator/")) {
    filePath = path.join(root, safePath.slice("/terrain-portrait-generator/".length));
  } else {
    filePath = path.normalize(path.join(root, safePath));
  }
  const resolvedFilePath = path.resolve(filePath);
  const resolvedAllowedRoot = path.resolve(allowedRoot) + path.sep;
  if (!resolvedFilePath.startsWith(resolvedAllowedRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolvedFilePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(resolvedFilePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`Photo & Music Prompt Builder: http://localhost:${port}/suno-generator.html`);
});
