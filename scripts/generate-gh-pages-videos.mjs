import fs from 'node:fs/promises';
import path from 'node:path';

function toPosixPath(p) {
  return p.split(path.sep).join(path.posix.sep);
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walk(abs)));
      continue;
    }
    out.push(abs);
  }
  return out;
}

function isVideoFile(absPath) {
  const base = path.basename(absPath).toLowerCase();
  if (base === 'video.webm' || base === 'video.mp4') return true;
  return false;
}

async function main() {
  const repoRoot = process.cwd();
  const artifactsDir = path.join(repoRoot, 'artifacts');
  const docsDir = path.join(repoRoot, 'docs');
  const outPath = path.join(docsDir, 'videos.json');

  let files = [];
  try {
    files = await walk(artifactsDir);
  } catch {
    files = [];
  }

  const videos = files
    .filter(isVideoFile)
    .map((abs) => toPosixPath(path.relative(repoRoot, abs)))
    .sort((a, b) => a.localeCompare(b));

  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify({ videos }, null, 2)}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${videos.length} video paths to ${toPosixPath(path.relative(repoRoot, outPath))}`);
}

await main();

