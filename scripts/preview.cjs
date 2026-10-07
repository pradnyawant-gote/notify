const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
};
if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('Run npm run export:web first.');
  process.exit(1);
}
http
  .createServer((req, res) => {
    let requestPath;
    try {
      requestPath = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    const candidate = path.resolve(root, '.' + requestPath);
    if (!candidate.startsWith(root + path.sep) && candidate !== root) {
      res.writeHead(403);
      res.end();
      return;
    }
    const file =
      fs.existsSync(candidate) && fs.statSync(candidate).isFile()
        ? candidate
        : path.join(root, 'index.html');
    if (file !== candidate && path.extname(candidate) && requestPath !== '/') {
      res.writeHead(404);
      res.end('Asset not found');
      return;
    }
    res.setHeader(
      'Content-Type',
      mime[path.extname(file)] || 'application/octet-stream',
    );
    res.setHeader('Cache-Control', 'no-cache');
    const stream = fs.createReadStream(file);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(503);
        res.end('DayFlow is being rebuilt. Please reload in a moment.');
      } else res.destroy();
    });
    stream.pipe(res);
  })
  .listen(4173, '127.0.0.1', () =>
    console.log('DayFlow preview: http://localhost:4173'),
  );
