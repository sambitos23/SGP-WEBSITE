/**
 * Local development server.
 * Serves static files + handles /api/signup and /api/login using MongoDB.
 *
 * Usage:
 *   1. Make sure .env has your MONGODB_URI
 *   2. Run: node dev-server.js
 *   3. Open: http://localhost:3000
 */

require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import the serverless handlers
const signupHandler = require('./api/signup');
const loginHandler = require('./api/login');
const contactHandler = require('./api/contact');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

/**
 * Wraps the Vercel-style handler (req, res) with a fake res object
 * that mimics Vercel's res.status().json() API on top of raw http.ServerResponse.
 */
function adaptRes(rawRes) {
  rawRes.status = (code) => {
    rawRes.statusCode = code;
    return rawRes;
  };
  rawRes.json = (data) => {
    rawRes.setHeader('Content-Type', 'application/json');
    rawRes.end(JSON.stringify(data));
  };
  rawRes.end = rawRes.end.bind(rawRes);
  return rawRes;
}

/**
 * Parse JSON body from an incoming request.
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API routes
  if (pathname === '/api/signup' || pathname === '/api/login' || pathname === '/api/contact') {
    // Parse body and attach it (mimics Vercel's automatic body parsing)
    req.body = await parseBody(req);
    const adapted = adaptRes(res);

    if (pathname === '/api/signup') {
      return signupHandler(req, adapted);
    } else if (pathname === '/api/login') {
      return loginHandler(req, adapted);
    } else {
      return contactHandler(req, adapted);
    }
  }

  // Static file serving
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  filePath = path.join(ROOT_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + pathname);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Dev server running at http://localhost:${PORT}\n`);
  console.log(`  Frontend: http://localhost:${PORT}`);
  console.log(`  API:      http://localhost:${PORT}/api/signup`);
  console.log(`            http://localhost:${PORT}/api/login\n`);
});
