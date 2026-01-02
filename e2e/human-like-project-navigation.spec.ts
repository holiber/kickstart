import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

import { Human, prepareTestArtifactDir } from './human';

test('human-like: go through project pages (video + screenshots)', async ({
  browser,
}, testInfo) => {
  const { dir } = await prepareTestArtifactDir(testInfo);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir },
  });
  const page = await context.newPage();
  const video = page.video();
  const human = Human.fromEnv(page);

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('project-list')).toBeVisible();

  const projects = [
    { id: 'p-nosync', name: 'TodoList - no sync' },
    { id: 'p-fullsync', name: 'TodoList - full-sync' },
    { id: 'p-pullonly', name: 'Todo - pull only' },
  ];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]!;

    // Move to the target project (even for the first one, to keep the video consistent).
    await human.waitBetweenActions();
    await human.click(page.getByTestId(`project-${p.id}`));

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.name);

    // Screenshot before moving to the next project.
    const shotName = `${String(i + 1).padStart(2, '0')}-${p.id}.png`;
    await human.screenshot(path.join(dir, shotName));
  }

  await page.close();
  await context.close();

  const videoPath = video ? await video.path() : null;
  if (videoPath) {
    await fs.rename(videoPath, path.join(dir, 'video.webm'));
  }
});
