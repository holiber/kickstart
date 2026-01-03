import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

import { expect, test } from '@playwright/test';

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}

function safeResolve(baseDir: string, urlPath: string): string | null {
  const raw = urlPath.split('?')[0] ?? '/';
  const decoded = decodeURIComponent(raw);
  const normalizedPath = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  const resolved = path.resolve(baseDir, normalizedPath);
  const baseResolved = path.resolve(baseDir);
  if (!resolved.startsWith(baseResolved + path.sep) && resolved !== baseResolved) return null;
  return resolved;
}

async function startGhPagesPreviewServer() {
  const docsDir = path.join(process.cwd(), 'docs');
  const artifactsDir = path.join(process.cwd(), 'artifacts');

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = req.url ?? '/';
      const requestPath = requestUrl.split('?')[0] ?? '/';

      const isArtifacts = requestPath === '/artifacts' || requestPath.startsWith('/artifacts/');
      const baseDir = isArtifacts ? artifactsDir : docsDir;

      let filePath: string | null;
      if (requestPath === '/' || requestPath === '') {
        filePath = path.join(docsDir, 'index.html');
      } else {
        filePath = safeResolve(baseDir, requestPath);
      }

      if (!filePath) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Bad request');
        return;
      }

      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Not found');
        return;
      }

      if (stat.isDirectory()) {
        res.statusCode = 301;
        res.setHeader('Location', `${requestPath.replace(/\/?$/, '/')}`);
        res.end();
        return;
      }

      const buf = await fs.readFile(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentTypeFor(filePath));
      res.setHeader('Cache-Control', 'no-store');
      res.end(buf);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Internal error: ${String(err)}`);
    }
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to bind preview server');

  const url = `http://127.0.0.1:${address.port}`;
  return {
    url,
    close: async () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

test('gh-pages: tabs render and screenshots are saved', async ({ page }) => {
  const outDir = path.join(process.cwd(), 'artifacts', 'gh-pages');
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const preview = await startGhPagesPreviewServer();
  try {
    await page.goto(preview.url, { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('panel-metrics')).toBeVisible();
    await expect(page.getByText('TODO: metrics will be added here.')).toBeVisible();
    await page.screenshot({ path: path.join(outDir, '01-metrics.png'), fullPage: true });

    await page.getByTestId('tab-videos').click();
    await expect(page.getByTestId('panel-videos')).toBeVisible();

    // If there are no videos yet, we still want to capture the UI state.
    const hasVideoItems = page.locator('[data-testid="video-item"]');
    await expect(
      hasVideoItems.first().or(page.getByText('No videos found under artifacts/.')),
    ).toBeVisible();

    await page.screenshot({ path: path.join(outDir, '02-videos.png'), fullPage: true });
  } finally {
    await preview.close();
  }
});
