# The Kikstart template 🚀

The purpose of this project is to provide super a template with super comperhansive UI with free tools and without sharing your (maby private) code with third parties except github 🕵️
There is the tabel of features we are going to try to integrade. Each feature have a Tier number from 1 to 4.

- Tier 1: immediate wins, low maintenance, broadly reusable across backend/api/web/cli.
- Tier 2: still common, but needs a bit more wiring + baselines.
- Tier 3: real engineering effort; worth it if you’ll reuse across many repos.
- Tier 4: “ambitious/experimental”: higher upkeep, more brittle, or niche.

| Id | Category | Description | Tools | Tier |
|---|---|---|---|---|
| ci-lint-format-typecheck | 🧹 Code Quality | **Quality gates (lint/format/typecheck)** — fast checks that fail PRs early | ESLint, Prettier, TypeScript `tsc`, (optional) Biome, GitHub Actions | 🟢 Tier 1 |
| ci-test-run | 🧪 Testing | **Test execution in CI** — run unit/integration tests reliably | Vitest/Jest, Node test runner, GitHub Actions | 🟢 Tier 1 |
| ci-test-reporter | 🧪 Testing | **Test reporting in PR checks** — surface failures in GitHub UI | `dorny/test-reporter`, GH Actions Job Summary, JUnit reporters | 🟢 Tier 1 |
| ci-test-metrics | 📈 Metrics | **Test count & duration tracking** — #tests + total time + trend | Vitest/Jest JSON output, custom parser, GH Actions summary, artifact JSON | 🟢 Tier 1 |
| ci-coverage | 🧪 Testing | **Code coverage reporting** — line/branch/function + PR delta | `c8`/Istanbul/nyc, lcov + report action, PR comment/check | 🟢 Tier 1 |
| ci-coverage-gate | 🧪 Testing | **Coverage gate (diff/threshold)** — enforce minimums | `c8` + custom diff logic, lcov diff tooling | 🟡 Tier 2 |
| ci-artifacts-bundle | 🔎 Observability | **Unified CI artifacts bundle** — pack logs/reports/screenshots | GitHub Actions artifacts, structured folders, zip step | 🟢 Tier 1 |
| ci-cache | ⚙️ CI | **CI caching** — speed up installs/builds/tests | `actions/cache`, pnpm/yarn/npm cache, build caches | 🟢 Tier 1 |
| ci-workflow-timings | ⚙️ CI | **CI step timing observability** — know what’s slow in pipeline | GH Actions timings + custom summary, `act` locally | 🟡 Tier 2 |
| ci-nightly-full-suite | ⚙️ CI | **Nightly full suite** — heavy checks run on schedule | GitHub scheduled workflows | 🟡 Tier 2 |
| deps-inventory | 📦 Dependencies | **Dependency inventory** — direct/transitive counts + basic stats | `pnpm list`, `npm ls`, custom script, lockfile parsing | 🟡 Tier 2 |
| deps-hygiene | 📦 Dependencies | **Dependency hygiene checks** — unused deps, duplicates, policies | `depcheck`, pnpm dedupe, lockfile lint, custom allow/deny | 🟡 Tier 2 |
| deps-auto-update | 📦 Dependencies | **Automated dependency update PRs** | Dependabot (built-in) or Renovate (self-hosted) | 🟢 Tier 1 |
| deps-update-benchmark | 📦 Dependencies | **Auto-update + benchmark validation** — run metrics on update PR | Dependabot/Renovate + workflows that run full metric suite | 🟡 Tier 2 |
| deps-update-labeling | 📦 Dependencies | **Regression/improvement labeling on update PRs** | Custom PR comment + labels via GitHub API | 🟠 Tier 3 |
| bundle-size-tracking | 📦 Build/Bundle | **Bundle size tracking (per entry/chunk)** | `size-limit`, `webpack-bundle-analyzer`, `rollup-plugin-visualizer`, `source-map-explorer` | 🟢 Tier 1 |
| bundle-size-budget | 📦 Build/Bundle | **Bundle budgets** — fail when exceeding budget | `size-limit` + GH Action | 🟢 Tier 1 |
| bundle-diff | 📦 Build/Bundle | **Bundle diff (PR vs main)** — what changed in size | size-limit PR comments, custom artifact comparison | 🟡 Tier 2 |
| treeshaking-audit | 📦 Build/Bundle | **Tree-shaking effectiveness audit** — detect non-shakeable imports | bundler analyzer, `sideEffects` audits, ESM/CJS checks | 🟠 Tier 3 |
| bundle-duplication | 📦 Build/Bundle | **Duplicate code / dependency duplication detection** | lockfile analysis, webpack stats, `pnpm why`, custom scripts | 🟠 Tier 3 |
| build-hotspots | ⚡️ Performance | **Build pipeline hotspot profiling** — which step/plugin is slow | webpack `--profile`, Vite debug logs, custom timers | 🟡 Tier 2 |
| build-cold-time | ⚡️ Performance | **Cold build time measurement** — clean build duration | timed GH steps, `hyperfine`, custom scripts | 🟢 Tier 1 |
| build-incremental-time | ⚡️ Performance | **Incremental build measurement** — rebuild after change | watch mode + scripted edits, `hyperfine` | 🟡 Tier 2 |
| dev-server-startup | 🧑‍💻 DevEx | **Dev server startup time** — command → ready | custom timing hooks, Vite/webpack logs, `wait-on` | 🟡 Tier 2 |
| prod-startup | ⚡️ Performance | **Production startup time** — app start / server boot | `node --perf-basic-prof`, custom timing in entrypoint | 🟡 Tier 2 |
| hmr-latency | 🧑‍💻 DevEx | **HMR latency** — change → browser updated | Playwright + file edit + measure, Vite HMR hooks | 🟠 Tier 3 |
| watch-rebuild-latency | 🧑‍💻 DevEx | **Watch rebuild latency** — change → build finished | watch mode logs parsing, custom timers | 🟡 Tier 2 |
| event-loop-blocking | ⚡️ Performance | **Event loop blocking detection** — long tasks > X ms | `perf_hooks`, `blocked-at`, `clinic doctor`, custom tracing | 🟡 Tier 2 |
| cpu-profile-capture | ⚡️ Performance | **CPU profiling on demand** — flamegraphs for regressions | `node --prof`, `0x`, `clinic flame`, pprof | 🟠 Tier 3 |
| memory-snapshots | ⚡️ Performance | **Memory snapshots / leak hints** | heap snapshots, `clinic heapprofiler`, `--inspect` | 🟠 Tier 3 |
| e2e-framework | 🧭 E2E | **E2E test framework** — browser automation | Playwright (recommended), optional WebdriverIO | 🟢 Tier 1 |
| e2e-artifacts | 🧭 E2E | **E2E artifacts (trace/video/screenshots)** | Playwright trace viewer, videos/screenshots as artifacts | 🟢 Tier 1 |
| visual-regression | 🎨 Visual | **Visual regression testing** — screenshot comparisons | Playwright `toHaveScreenshot`, optional Storybook snapshots | 🟡 Tier 2 |
| golden-update-flow | 🎨 Visual | **Golden/baseline update workflow** — accept new snapshots fast | Playwright update snapshots, PR with snapshot diffs, artifacts | 🟡 Tier 2 |
| visual-diff-viewer | 🎨 Visual | **Visual diff visualization** — easy review of diffs | Playwright HTML report, custom GH Pages gallery | 🟠 Tier 3 |
| browser-console-logs | 🔎 Observability | **Browser console log capture** — console errors/warns saved | Playwright listeners + artifact logs | 🟡 Tier 2 |
| network-capture | 🔎 Observability | **Network capture (HAR/requests)** — record requests for debugging | Playwright HAR, tracing, custom network logs | 🟠 Tier 3 |
| failed-page-snapshot | 🧭 E2E | **Failure snapshot pack** — screenshot + DOM snapshot on fail | Playwright screenshot + DOM dump + trace | 🟡 Tier 2 |
| deterministic-replay | 🧭 E2E | **Deterministic replay with mocked API** — re-run UI actions w/ same API | Playwright route mocking, HAR replay, MSW, local stubs | 🟠 Tier 3 |
| human-like-e2e | 🧭 E2E | **Human-like interaction simulation** — delays, smooth mouse, type-by-type | Playwright scripted “humanizer” layer | 🔴 Tier 4 |
| ui-smoothness-telemetry | ⚡️ Performance | **UI smoothness telemetry during E2E** — long tasks/FPS-ish signals | PerformanceObserver, tracing, Chrome DevTools Protocol | 🔴 Tier 4 |
| tui-testing | 🖥️ CLI/TUI | **TUI golden testing (video/snapshots)** | `charmbracelet/vhs`, `asciinema`, snapshot text diffs | 🟠 Tier 3 |
| tui-replay | 🖥️ CLI/TUI | **TUI interaction replay** — scripted inputs + deterministic output | `expect`, pty harness, VHS tapes | 🔴 Tier 4 |
| logs-into-artifacts | 🔎 Observability | **Console/test log collection** — standardize logs to artifacts | GH Actions artifacts, structured logs, log scrubbing | 🟢 Tier 1 |
| metrics-history | 📈 Metrics | **Metrics history (time series)** — store results per commit | `github-action-benchmark`, JSON in `gh-pages` or repo branch | 🟡 Tier 2 |
| pr-baseline-compare | 📈 Metrics | **PR vs baseline comparison** — show deltas in PR | custom scripts, GH Checks / PR comments | 🟡 Tier 2 |
| metrics-dashboard-pages | 📈 Metrics | **Metrics dashboard on GitHub Pages** | static site generator + charts, `gh-pages` branch | 🟡 Tier 2 |
| readme-badges | 📈 Metrics | **README badges for key metrics** | generate SVG badges in repo/pages (no external SaaS) | 🟡 Tier 2 |
| changelog-automation | 🚀 Releases | **Changelog automation** — conventional commits → changelog | release-please, Changesets | 🟢 Tier 1 |
| release-orchestration | 🚀 Releases | **Release automation** — tags, GitHub Releases, publish packages | release-please / Changesets + GH Actions | 🟡 Tier 2 |
| versioning-strategy | 🧩 Monorepo | **Versioning strategy for monorepo/workspace** | Changesets, semantic-release (self-contained), pnpm workspaces | 🟡 Tier 2 |
| monorepo-task-runner | 🧩 Monorepo | **Monorepo task orchestration** — affected-only builds/tests | Turborepo / Nx (optional), pnpm workspaces | 🟠 Tier 3 |
| test-selection | ⚙️ CI | **Test selection (affected-only)** — run only impacted tests | Nx/Turbo affected, custom git diff mapping | 🟠 Tier 3 |
| preview-envs | 🚚 Delivery | **PR preview deployments** — ephemeral env per PR | GitHub Pages (static) / external hosting (optional) | 🔴 Tier 4 |
| e2e-against-preview | 🚚 Delivery | **E2E against preview URL** | Playwright against deployed preview | 🔴 Tier 4 |
| docs-site | 📚 Docs | **Docs site generation/publish** | Docusaurus/Typedoc + GH Pages | 🟠 Tier 3 |
| adr-template | 📚 Docs | **Architecture Decision Records (ADR)** | Markdown template + index generator | 🟡 Tier 2 |
| storybook | 📚 Docs | **Component workshop (Storybook)** | Storybook + build/publish + optional visual tests | 🟠 Tier 3 |
| secrets-scan | 🛡️ Security | **Secret scanning in CI** | Gitleaks / TruffleHog (run in GH Actions) | 🟡 Tier 2 |
| vuln-scan | 🛡️ Security | **Dependency vulnerability scan (local-only)** | `npm audit`/`pnpm audit`, OSV scanner | 🟠 Tier 3 |
| license-compliance | 🛡️ Security | **License compliance checks** | license-checker / pnpm licenses + allow/deny list | 🟠 Tier 3 |
| sbom | 🛡️ Security | **SBOM generation** | CycloneDX/SPDX generators | 🔴 Tier 4 |
| provenance-attest | 🛡️ Security | **Build provenance / attestations** | GitHub attestations / SLSA-style (advanced) | 🔴 Tier 4 |
| ai-agent-interface | 🤖 AI | **Pluggable AI agent integration** — provider-agnostic interface | custom abstraction + model adapters; run in GH Actions | 🔴 Tier 4 |
| ai-sandbox-policy | 🤖 AI | **AI sandbox/policy controls** — limit permissions/cost/scope | GH token scopes, job permissions, budget enforcement | 🔴 Tier 4 |
| multi-branch-benchmark | 🤖 AI | **Multi-branch evaluation harness** — compare competing solutions | consistent workflows + metrics + baseline branch | 🔴 Tier 4 |
| token-cost-accounting | 🤖 AI | **Token/cost accounting per PR** | provider usage logs, GH artifacts, PR summary | 🔴 Tier 4 |
| scorecard | 📈 Metrics | **Scorecard summary** — single report: quality + perf + cost | custom generator to Markdown/HTML | 🟠 Tier 3 |
