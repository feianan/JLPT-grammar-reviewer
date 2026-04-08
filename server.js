#!/usr/bin/env node
// 啟動方式: node server.js（API key 放在 .env 檔）

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// 讀取 .env 檔
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    });
}

const PORT = 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("❌ 請設定環境變數 ANTHROPIC_API_KEY");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Proxy: POST /api/messages → Anthropic
  if (req.method === "POST" && req.url === "/api/messages") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const options = {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const proxy = https.request(options, (apiRes) => {
        res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
        apiRes.pipe(res);
      });

      proxy.on("error", (e) => {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      });

      proxy.write(body);
      proxy.end();
    });
    return;
  }

  // Static files
  let filePath = req.url === "/" ? "/grammar-reviewer.html" : req.url;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ 伺服器啟動：http://localhost:${PORT}`);
});
