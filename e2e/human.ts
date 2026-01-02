import fs from 'node:fs/promises';
import path from 'node:path';

import type { Locator, Page, TestInfo } from '@playwright/test';

type HumanOptions = {
  enabled: boolean;
  betweenActionsDelayMs: { min: number; max: number };
};

function randomInt(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function prepareTestArtifactDir(testInfo: TestInfo) {
  const testName = slugify(testInfo.title) || 'test';
  const dir = path.join(process.cwd(), 'artifacts', 'test', testName);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  return { dir, testName };
}

export class Human {
  private mousePos: { x: number; y: number } | null = null;

  constructor(
    private readonly page: Page,
    private readonly opts: HumanOptions,
  ) {}

  static fromEnv(page: Page, overrides?: Partial<HumanOptions>) {
    const enabled = (process.env.HUMAN_LIKE ?? '') === '1';
    return new Human(page, {
      enabled,
      betweenActionsDelayMs: { min: 1000, max: 2000 },
      ...overrides,
    });
  }

  async waitBetweenActions() {
    if (!this.opts.enabled) return;
    const { min, max } = this.opts.betweenActionsDelayMs;
    await this.page.waitForTimeout(randomInt(min, max));
  }

  async screenshot(filePath: string) {
    await this.page.screenshot({ path: filePath, fullPage: true });
  }

  private async ensureMouseInitialized() {
    if (this.mousePos) return;
    const vp = this.page.viewportSize() ?? { width: 1280, height: 720 };
    this.mousePos = { x: randomInt(10, vp.width - 10), y: randomInt(10, vp.height - 10) };
    await this.page.mouse.move(this.mousePos.x, this.mousePos.y);
  }

  private async moveMouseSmooth(x: number, y: number) {
    await this.ensureMouseInitialized();
    const from = this.mousePos!;

    const dx = x - from.x;
    const dy = y - from.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.min(80, Math.max(15, Math.round(dist / 12)));

    // Multi-segment move to avoid a perfectly straight line.
    const mid1 = {
      x: from.x + dx * 0.4 + randomInt(-8, 8),
      y: from.y + dy * 0.4 + randomInt(-8, 8),
    };
    const mid2 = {
      x: from.x + dx * 0.75 + randomInt(-6, 6),
      y: from.y + dy * 0.75 + randomInt(-6, 6),
    };

    await this.page.mouse.move(mid1.x, mid1.y, { steps: Math.round(steps * 0.4) });
    await this.page.mouse.move(mid2.x, mid2.y, { steps: Math.round(steps * 0.35) });
    await this.page.mouse.move(x, y, { steps: Math.max(5, Math.round(steps * 0.25)) });

    this.mousePos = { x, y };
  }

  async moveTo(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) return;

    const x = box.x + box.width * (randomInt(35, 65) / 100);
    const y = box.y + box.height * (randomInt(35, 65) / 100);

    if (this.opts.enabled) {
      await this.moveMouseSmooth(x, y);
    } else {
      await this.page.mouse.move(x, y);
      this.mousePos = { x, y };
    }
  }

  async click(locator: Locator) {
    await this.moveTo(locator);
    if (this.opts.enabled) {
      await locator.click({ delay: randomInt(40, 140) });
    } else {
      await locator.click();
    }
  }

  async type(locator: Locator, text: string) {
    await this.click(locator);
    if (!this.opts.enabled) {
      await locator.fill(text);
      return;
    }

    // Human-like per-character typing with occasional small pauses.
    for (const ch of text) {
      await this.page.keyboard.type(ch, { delay: randomInt(30, 120) });
      if (Math.random() < 0.06) await this.page.waitForTimeout(randomInt(120, 380));
    }
  }

  async press(key: string) {
    if (this.opts.enabled) await this.page.waitForTimeout(randomInt(30, 120));
    await this.page.keyboard.press(key);
  }
}
