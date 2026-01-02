# Features

This repo uses a small feature flag system to enable/disable automation features without editing workflows. Flags live in `.github/template.config.json` under the `features` key.

## `ci-lint-format-typecheck`

Adds a fast PR quality gate that runs:

- ESLint (`npm run lint`)
- Prettier check (`npm run format:check`)
- TypeScript typecheck (`npm run typecheck`)

### Toggle

Edit `.github/template.config.json`:

```json
{
  "features": {
    "ci-lint-format-typecheck": { "enabled": true }
  }
}
```

Set `"enabled": false` to skip the GitHub Actions `quality` job.
