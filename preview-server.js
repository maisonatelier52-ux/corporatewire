import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || process.argv[2] || 8765);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function safeFile(relativePath) {
  const candidate = path.resolve(root, relativePath.replace(/^[/\\]+/, ''));
  return candidate === root || candidate.startsWith(root + path.sep) ? candidate : null;
}

function sendFile(response, filePath, statusCode = 200) {
  const type = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  response.writeHead(statusCode, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || `${host}:${port}`}`);
  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  // Mirror production: .html and trailing-slash variants redirect once to the
  // extensionless, no-trailing-slash URL.
  if (pathname === '/index.html') {
    response.writeHead(308, { Location: `/${requestUrl.search}` });
    response.end();
    return;
  }

  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.slice(0, -5) || '/';
    response.writeHead(308, { Location: `${cleanPath}${requestUrl.search}` });
    response.end();
    return;
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    const cleanPath = pathname.replace(/\/+$/, '');
    const cleanFile = safeFile(`${cleanPath}.html`);
    if (cleanFile && fs.existsSync(cleanFile)) {
      response.writeHead(308, { Location: `${cleanPath}${requestUrl.search}` });
      response.end();
      return;
    }
  }

  if (pathname === '/') {
    sendFile(response, path.join(root, 'index.html'));
    return;
  }

  const requestedFile = safeFile(pathname);
  if (requestedFile && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    sendFile(response, requestedFile);
    return;
  }

  const cleanRouteFile = safeFile(`${pathname.replace(/\/+$/, '')}.html`);
  if (cleanRouteFile && fs.existsSync(cleanRouteFile) && fs.statSync(cleanRouteFile).isFile()) {
    sendFile(response, cleanRouteFile);
    return;
  }

  const notFound = path.join(root, '404.html');
  if (fs.existsSync(notFound)) sendFile(response, notFound, 404);
  else {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`CorporateWire preview: http://${host}:${port}/`);
  console.log('Press Ctrl+C to stop.');
});
