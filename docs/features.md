# Features

This repository uses a simple feature-flag system to enable/disable CI capabilities without editing workflow files.

## How to toggle a feature

Edit `.github/template.config.json`:

```json
{
  "features": {
    "some-feature-id": { "enabled": true }
  }
}
```

## `ci-lint-format-typecheck`

**Goal**: fast PR quality gates (lint / format check / TypeScript typecheck).

**When enabled**: GitHub Actions runs a `quality` job that executes:

- `npm ci`
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`

**How to enable/disable**: set:

```json
{
  "features": {
    "ci-lint-format-typecheck": { "enabled": true }
  }
}
```

**Run locally**:

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
```
