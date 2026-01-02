import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

import { Human, prepareTestArtifactDir } from './human';

test('human-like: no-sync todo add/edit/toggle/delete (video + screenshots)', async ({
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

  await human.waitBetweenActions();
  await human.click(page.getByTestId('project-p-nosync'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TodoList - no sync');

  const todoText = `Human-like todo ${Date.now()}`;

  await human.waitBetweenActions();
  await human.type(page.getByTestId('add-todo-input'), todoText);
  await human.press('Enter');

  const row = page.locator('li', { hasText: todoText });
  await expect(row).toBeVisible();
  const todoItemTestId = await row.getAttribute('data-testid');
  if (!todoItemTestId) throw new Error('Expected todo item to have data-testid');
  const todoItem = page.locator(`[data-testid="${todoItemTestId}"]`);
  await human.screenshot(path.join(dir, '01-after-add.png'));

  // Edit text (human-like).
  const editTarget = todoItem.locator('button[data-testid^="todo-text-"]');
  await human.waitBetweenActions();
  await human.click(editTarget);

  const editInput = todoItem.locator('input[data-testid^="todo-text-"]');
  await expect(editInput).toBeVisible();
  await human.press('Control+A');
  await human.press('Backspace');

  const updatedText = `${todoText} (edited)`;
  await human.type(editInput, updatedText);
  await human.press('Enter');
  await expect(todoItem).toContainText(updatedText);
  await human.screenshot(path.join(dir, '02-after-edit.png'));

  // Toggle completed.
  const checkbox = todoItem.locator('[data-testid^="todo-checkbox-"]');
  await human.waitBetweenActions();
  await human.click(checkbox);
  await human.screenshot(path.join(dir, '03-after-toggle.png'));

  // Delete.
  const del = todoItem.locator('[data-testid^="todo-delete-"]');
  await human.waitBetweenActions();
  await human.click(del);
  await expect(todoItem).toHaveCount(0);
  await human.screenshot(path.join(dir, '04-after-delete.png'));

  await page.close();
  await context.close();

  const videoPath = video ? await video.path() : null;
  if (videoPath) {
    await fs.rename(videoPath, path.join(dir, 'video.webm'));
  }
});
