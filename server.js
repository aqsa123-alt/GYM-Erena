const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse requested URL
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Clean and route paths
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/gym') {
    pathname = '/gym.html';
  } else if (pathname === '/boxing') {
    pathname = '/boxing.html';
  } else if (pathname === '/badminton') {
    pathname = '/badminton.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(path.join(BASE_DIR, pathname));
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 handler
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Page Not Found - Elite Arena</title>
          <style>
            body { background: #121316; color: #e3e2e6; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #ff5708; }
            p { font-size: 1.2rem; color: #a0a0a0; margin-bottom: 2rem; }
            a { color: #ffffff; background: #ff5708; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: bold; }
            a:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <h1>404</h1>
          <p>Page Not Found</p>
          <a href="/">Back to Elite Arena Home</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(safePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
===========================================================
  ⚡ ELITE ARENA SPORTS CLUB - LOCAL SERVER READY ⚡
===========================================================

  Local:   http://localhost:${PORT}
  Network: http://127.0.0.1:${PORT}

  Available Pages:
  - Home:       http://localhost:${PORT}/
  - Gym:        http://localhost:${PORT}/gym
  - Boxing:     http://localhost:${PORT}/boxing
  - Badminton:  http://localhost:${PORT}/badminton

===========================================================
`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is in use. Retrying on port ${PORT + 1}...`);
    server.listen(PORT + 1, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});
