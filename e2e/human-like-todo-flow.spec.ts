import fs from 'node:fs/promises';
import path from 'node:path';

import { devices, expect, test } from '@playwright/test';

import { Human, prepareTestArtifactDir } from './human';

test('human-like: mobile interact through projects (video + screenshots + console)', async ({
  browser,
}, testInfo) => {
  const { dir } = await prepareTestArtifactDir(testInfo);

  const context = await browser.newContext({
    ...devices['iPhone 14'],
    recordVideo: { dir },
  });
  const page = await context.newPage();
  const video = page.video();
  const human = Human.fromEnv(page);

  const consoleLines: string[] = [];
  page.on('console', (msg) => consoleLines.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLines.push(`[pageerror] ${err.message}`));

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const openMenu = page.getByRole('button', { name: 'Open menu' });

  async function openSidebar() {
    await human.waitBetweenActions();
    await human.click(openMenu);
    await expect(page.getByTestId('project-list')).toBeVisible();
  }

  async function closeOverlays() {
    // Escape reliably closes dropdowns / dialogs / sheets in this UI.
    await human.waitBetweenActions();
    await human.press('Escape');
  }

  async function setAllTodosCompleted(shouldBeCompleted: boolean) {
    const checkboxes = page.locator('[data-testid^="todo-checkbox-"]');
    await expect(checkboxes.first()).toBeVisible();
    const n = await checkboxes.count();
    for (let i = 0; i < n; i++) {
      const cb = checkboxes.nth(i);
      const state = await cb.getAttribute('data-state');
      const isChecked = state === 'checked';
      if (isChecked !== shouldBeCompleted) {
        await human.waitBetweenActions();
        await human.click(cb);
      }
    }
  }

  // task1: switch to dark mode (mobile view).
  await openSidebar();
  await human.waitBetweenActions();
  await human.click(page.getByRole('button', { name: 'Theme' }));
  await human.waitBetweenActions();
  await human.click(page.getByRole('menuitemradio', { name: 'Dark' }));
  await closeOverlays();
  await human.screenshot(path.join(dir, '01-dark-mode.png'));

  // task2: mark all todos in first project as completed.
  await setAllTodosCompleted(true);
  await human.screenshot(path.join(dir, '02-first-project-all-completed.png'));

  // task3: mark all todos in first project as uncompleted.
  await setAllTodosCompleted(false);
  await human.screenshot(path.join(dir, '03-first-project-all-uncompleted.png'));

  // task4: switch to second project (full-sync) and add a todo.
  await openSidebar();
  await human.waitBetweenActions();
  await human.click(page.getByTestId('project-p-fullsync'));
  await closeOverlays();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TodoList - full-sync');

  const todoText = `Human-like (full-sync) ${Date.now()}`;
  await human.waitBetweenActions();
  await human.type(page.getByTestId('add-todo-input'), todoText);
  await human.press('Enter');

  const createdRow = page.locator('li', { hasText: todoText });
  await expect(createdRow).toBeVisible();
  await human.screenshot(path.join(dir, '04-second-project-after-add.png'));

  // task5: edit just-created todo.
  await human.waitBetweenActions();
  await human.click(createdRow.locator('button[data-testid^="todo-text-"]'));
  const editInput = createdRow.locator('input[data-testid^="todo-text-"]');
  await expect(editInput).toBeVisible();

  await human.press('Control+A');
  await human.press('Backspace');
  const updatedText = `${todoText} (edited)`;
  await human.type(editInput, updatedText);
  await human.press('Enter');
  await expect(createdRow).toContainText(updatedText);
  await human.screenshot(path.join(dir, '05-second-project-after-edit.png'));

  // task6: delete all todos and wait until server bot creates a new todo.
  while ((await page.locator('[data-testid^="todo-delete-"]').count()) > 0) {
    await human.waitBetweenActions();
    await human.click(page.locator('[data-testid^="todo-delete-"]').first());
  }
  await expect(page.getByText('No todos yet.')).toBeVisible();
  await human.screenshot(path.join(dir, '06-second-project-after-delete-all.png'));

  // Bots are enabled for HUMAN_LIKE=1 via playwright.config.ts (DEMO_FREEZE_BOTS=0).
  await expect(page.locator('li', { hasText: /Bot created #/ })).toBeVisible({ timeout: 20_000 });
  await human.screenshot(path.join(dir, '07-second-project-after-bot-create.png'));

  // task7: create a new project, add a todo, and complete it.
  await openSidebar();
  await human.waitBetweenActions();
  await human.click(page.getByTestId('create-project'));

  const projectName = `Human-like project ${Date.now()}`;
  const projectNameInput = page.getByPlaceholder('Project name');
  await expect(projectNameInput).toBeVisible();
  await human.waitBetweenActions();
  await human.type(projectNameInput, projectName);
  await human.waitBetweenActions();
  await human.click(page.getByRole('button', { name: 'Create' }));
  await closeOverlays();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(projectName);

  const newProjectTodo = `First todo ${Date.now()}`;
  await human.waitBetweenActions();
  await human.type(page.getByTestId('add-todo-input'), newProjectTodo);
  await human.press('Enter');
  const newRow = page.locator('li', { hasText: newProjectTodo });
  await expect(newRow).toBeVisible();
  await human.waitBetweenActions();
  await human.click(newRow.locator('[data-testid^="todo-checkbox-"]'));
  await human.screenshot(path.join(dir, '08-new-project-todo-completed.png'));

  // task8: show console output (persist to artifacts) + best-effort devtools open.
  await human.waitBetweenActions();
  await page.evaluate(() => console.log('[human-like-e2e] console output captured'));
  await fs.writeFile(path.join(dir, 'console.txt'), `${consoleLines.join('\n')}\n`, 'utf8');

  await human.waitBetweenActions();
  await human.press('F12');
  await page.waitForTimeout(1000);
  await human.screenshot(path.join(dir, '09-devtools-or-page.png'));

  await page.close();
  await context.close();

  const videoPath = video ? await video.path() : null;
  if (videoPath) {
    await fs.rename(videoPath, path.join(dir, 'video.webm'));
  }
});
