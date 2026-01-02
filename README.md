<img width="1080" height="720" alt="image" src="https://github.com/user-attachments/assets/13a79d61-32b5-4800-a3d4-15552c4f4e4b" />

# The Kikstart template 🚀

The purpose of this project is to provide a template with a comprehensive UI, using free tools and without sharing your (potentially private) code with third parties—except GitHub 🕵️

Below is the table of features we plan to integrate. Each feature has a Tier number from 1 to 4:

- **Tier 1:** Immediate wins—low maintenance and broadly reusable across backend/API/web/CLI.
- **Tier 2:** Still common, but requires a bit more wiring and baseline setup.
- **Tier 3:** Significant engineering effort; worth it if you’ll reuse it across many repos.
- **Tier 4:** Ambitious/experimental—higher upkeep, more brittle, or niche.

| Id                       | Category         | Description                                                                                                            | Tools                                                                                      | Tier      |
| ------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------- |
| ci-lint-format-typecheck | 🧹 Code Quality  | **Quality gates (lint/format/typecheck)** — fast checks that fail PRs early                                            | ESLint, Prettier, TypeScript `tsc`, (optional) Biome, GitHub Actions                       | 🟢 Tier 1 |
| ci-test-run              | 🧪 Testing       | **Test execution in CI** — run unit/integration tests reliably                                                         | Vitest/Jest, Node test runner, GitHub Actions                                              | 🟢 Tier 1 |
| ci-test-reporter         | 🧪 Testing       | **Test reporting in PR checks** — surface failures in GitHub UI                                                        | `dorny/test-reporter`, GH Actions Job Summary, JUnit reporters                             | 🟢 Tier 1 |
| ci-test-metrics          | 📈 Metrics       | **Test count & duration tracking** — #tests + total time + trend                                                       | Vitest/Jest JSON output, custom parser, GH Actions summary, artifact JSON                  | 🟢 Tier 1 |
| ci-coverage              | 🧪 Testing       | **Code coverage reporting** — line/branch/function + PR delta                                                          | `c8`/Istanbul/nyc, lcov + report action, PR comment/check                                  | 🟢 Tier 1 |
| ci-coverage-gate         | 🧪 Testing       | **Coverage gate (diff/threshold)** — enforce minimums                                                                  | `c8` + custom diff logic, lcov diff tooling                                                | 🟡 Tier 2 |
| ci-artifacts-bundle      | 🔎 Observability | **Unified CI artifacts bundle** — pack logs/reports/screenshots                                                        | GitHub Actions artifacts, structured folders, zip step                                     | 🟢 Tier 1 |
| ci-summary-rich          | 🔎 Observability | **Rich CI summary for mobile review** — single GitHub Actions summary with key links + inline highlights               | GH Actions Job Summary (`GITHUB_STEP_SUMMARY`), Markdown generation script                 | 🟢 Tier 1 |
| artifact-index-html      | 🔎 Observability | **Artifact index page** — generate `index.html` that links screenshots/videos/traces/logs for one-tap review           | Static HTML generator + upload as artifact (or publish to GH Pages)                        | 🟢 Tier 1 |
| ci-cache                 | ⚙️ CI            | **CI caching** — speed up installs/builds/tests                                                                        | `actions/cache`, pnpm/yarn/npm cache, build caches                                         | 🟢 Tier 1 |
| ci-workflow-timings      | ⚙️ CI            | **CI step timing observability** — know what’s slow in pipeline                                                        | GH Actions timings + custom summary, `act` locally                                         | 🟡 Tier 2 |
| ci-nightly-full-suite    | ⚙️ CI            | **Nightly full suite** — heavy checks run on schedule                                                                  | GitHub scheduled workflows                                                                 | 🟡 Tier 2 |
| deps-inventory           | 📦 Dependencies  | **Dependency inventory** — direct/transitive counts + basic stats                                                      | `pnpm list`, `npm ls`, custom script, lockfile parsing                                     | 🟡 Tier 2 |
| deps-hygiene             | 📦 Dependencies  | **Dependency hygiene checks** — unused deps, duplicates, policies                                                      | `depcheck`, pnpm dedupe, lockfile lint, custom allow/deny                                  | 🟡 Tier 2 |
| deps-auto-update         | 📦 Dependencies  | **Automated dependency update PRs**                                                                                    | Dependabot (built-in) or Renovate (self-hosted)                                            | 🟢 Tier 1 |
| deps-update-benchmark    | 📦 Dependencies  | **Auto-update + benchmark validation** — run metrics on update PR                                                      | Dependabot/Renovate + workflows that run full metric suite                                 | 🟡 Tier 2 |
| deps-update-labeling     | 📦 Dependencies  | **Regression/improvement labeling on update PRs**                                                                      | Custom PR comment + labels via GitHub API                                                  | 🟠 Tier 3 |
| bundle-size-tracking     | 📦 Build/Bundle  | **Bundle size tracking (per entry/chunk)**                                                                             | `size-limit`, `webpack-bundle-analyzer`, `rollup-plugin-visualizer`, `source-map-explorer` | 🟢 Tier 1 |
| bundle-size-budget       | 📦 Build/Bundle  | **Bundle budgets** — fail when exceeding budget                                                                        | `size-limit` + GH Action                                                                   | 🟢 Tier 1 |
| bundle-diff              | 📦 Build/Bundle  | **Bundle diff (PR vs main)** — what changed in size                                                                    | size-limit PR comments, custom artifact comparison                                         | 🟡 Tier 2 |
| treeshaking-audit        | 📦 Build/Bundle  | **Tree-shaking effectiveness audit** — detect non-shakeable imports                                                    | bundler analyzer, `sideEffects` audits, ESM/CJS checks                                     | 🟠 Tier 3 |
| bundle-duplication       | 📦 Build/Bundle  | **Duplicate code / dependency duplication detection**                                                                  | lockfile analysis, webpack stats, `pnpm why`, custom scripts                               | 🟠 Tier 3 |
| build-hotspots           | ⚡️ Performance   | **Build pipeline hotspot profiling** — which step/plugin is slow                                                       | webpack `--profile`, Vite debug logs, custom timers                                        | 🟡 Tier 2 |
| build-cold-time          | ⚡️ Performance   | **Cold build time measurement** — clean build duration                                                                 | timed GH steps, `hyperfine`, custom scripts                                                | 🟢 Tier 1 |
| build-incremental-time   | ⚡️ Performance   | **Incremental build measurement** — rebuild after change                                                               | watch mode + scripted edits, `hyperfine`                                                   | 🟡 Tier 2 |
| dev-server-startup       | 🧑‍💻 DevEx         | **Dev server startup time** — command → ready                                                                          | custom timing hooks, Vite/webpack logs, `wait-on`                                          | 🟡 Tier 2 |
| prod-startup             | ⚡️ Performance   | **Production startup time** — app start / server boot                                                                  | `node --perf-basic-prof`, custom timing in entrypoint                                      | 🟡 Tier 2 |
| hmr-latency              | 🧑‍💻 DevEx         | **HMR latency** — change → browser updated                                                                             | Playwright + file edit + measure, Vite HMR hooks                                           | 🟠 Tier 3 |
| watch-rebuild-latency    | 🧑‍💻 DevEx         | **Watch rebuild latency** — change → build finished                                                                    | watch mode logs parsing, custom timers                                                     | 🟡 Tier 2 |
| event-loop-blocking      | ⚡️ Performance   | **Event loop blocking detection** — long tasks > X ms                                                                  | `perf_hooks`, `blocked-at`, `clinic doctor`, custom tracing                                | 🟡 Tier 2 |
| cpu-profile-capture      | ⚡️ Performance   | **CPU profiling on demand** — flamegraphs for regressions                                                              | `node --prof`, `0x`, `clinic flame`, pprof                                                 | 🟠 Tier 3 |
| memory-snapshots         | ⚡️ Performance   | **Memory snapshots / leak hints**                                                                                      | heap snapshots, `clinic heapprofiler`, `--inspect`                                         | 🟠 Tier 3 |
| e2e-framework            | 🧭 E2E           | **E2E test framework** — browser automation                                                                            | Playwright (recommended), optional WebdriverIO                                             | 🟢 Tier 1 |
| e2e-artifacts            | 🧭 E2E           | **E2E artifacts (trace/video/screenshots)** — always upload for quick review                                           | Playwright trace viewer, videos/screenshots as artifacts                                   | 🟢 Tier 1 |
| e2e-demo-flow-video      | 🧭 E2E           | **Recorded demo smoke flows** — scripted “happy paths” that always produce video/screenshots (ideal for mobile review) | Playwright projects, deterministic test data/demo mode, artifacts                          | 🟢 Tier 1 |
| visual-regression        | 🎨 Visual        | **Visual regression testing** — screenshot comparisons on critical flows                                               | Playwright `toHaveScreenshot`, optional Storybook snapshots                                | 🟢 Tier 1 |
| golden-update-flow       | 🎨 Visual        | **Golden/baseline update workflow** — accept new snapshots fast                                                        | Playwright update snapshots, PR with snapshot diffs, artifacts                             | 🟡 Tier 2 |
| visual-diff-viewer       | 🎨 Visual        | **Visual diff visualization** — easy review of diffs                                                                   | Playwright HTML report, custom GH Pages gallery                                            | 🟠 Tier 3 |
| browser-console-logs     | 🔎 Observability | **Browser console log capture** — console errors/warns saved                                                           | Playwright listeners + artifact logs                                                       | 🟢 Tier 1 |
| network-capture          | 🔎 Observability | **Network capture (HAR/requests)** — record requests for debugging                                                     | Playwright HAR, tracing, custom network logs                                               | 🟠 Tier 3 |
| failed-page-snapshot     | 🧭 E2E           | **Failure snapshot pack** — screenshot + DOM snapshot + trace on fail                                                  | Playwright screenshot + DOM dump + trace                                                   | 🟢 Tier 1 |
| deterministic-replay     | 🧭 E2E           | **Deterministic replay with mocked API** — re-run UI actions w/ same API responses                                     | Playwright route mocking, HAR replay, MSW, local stubs                                     | 🟠 Tier 3 |
| human-like-e2e           | 🧭 E2E           | **Human-like interaction simulation** — delays, smooth mouse, type-by-type (brittle)                                   | Playwright scripted “humanizer” layer                                                      | 🔴 Tier 4 |
| ui-smoothness-telemetry  | ⚡️ Performance   | **UI smoothness telemetry during E2E** — long tasks/FPS-ish signals (advanced)                                         | PerformanceObserver, tracing, Chrome DevTools Protocol                                     | 🔴 Tier 4 |
| tui-testing              | 🖥️ CLI/TUI       | **TUI golden testing (video/snapshots)**                                                                               | `charmbracelet/vhs`, `asciinema`, snapshot text diffs                                      | 🟠 Tier 3 |
| tui-replay               | 🖥️ CLI/TUI       | **TUI interaction replay** — scripted inputs + deterministic output (hard)                                             | `expect`, pty harness, VHS tapes                                                           | 🔴 Tier 4 |
| logs-into-artifacts      | 🔎 Observability | **Console/test log collection** — standardize logs to artifacts                                                        | GH Actions artifacts, structured logs, log scrubbing                                       | 🟢 Tier 1 |
| metrics-history          | 📈 Metrics       | **Metrics history (time series)** — store results per commit                                                           | `github-action-benchmark`, JSON in `gh-pages` or repo branch                               | 🟡 Tier 2 |
| pr-baseline-compare      | 📈 Metrics       | **PR vs baseline comparison** — show deltas in PR                                                                      | custom scripts, GH Checks / PR comments                                                    | 🟡 Tier 2 |
| metrics-dashboard-pages  | 📈 Metrics       | **Metrics dashboard on GitHub Pages**                                                                                  | static site generator + charts, `gh-pages` branch                                          | 🟡 Tier 2 |
| readme-badges            | 📈 Metrics       | **README badges for key metrics**                                                                                      | generate SVG badges in repo/pages (no external SaaS)                                       | 🟡 Tier 2 |
| changelog-automation     | 🚀 Releases      | **Changelog automation** — conventional commits → changelog                                                            | release-please, Changesets                                                                 | 🟢 Tier 1 |
| release-orchestration    | 🚀 Releases      | **Release automation** — tags, GitHub Releases, publish packages                                                       | release-please / Changesets + GH Actions                                                   | 🟡 Tier 2 |
| versioning-strategy      | 🧩 Monorepo      | **Versioning strategy for monorepo/workspace**                                                                         | Changesets, semantic-release (self-contained), pnpm workspaces                             | 🟡 Tier 2 |
| monorepo-task-runner     | 🧩 Monorepo      | **Monorepo task orchestration** — affected-only builds/tests                                                           | Turborepo / Nx (optional), pnpm workspaces                                                 | 🟠 Tier 3 |
| test-selection           | ⚙️ CI            | **Test selection (affected-only)** — run only impacted tests                                                           | Nx/Turbo affected, custom git diff mapping                                                 | 🟠 Tier 3 |
| preview-envs             | 🚚 Delivery      | **PR preview deployments** — ephemeral env per PR (often external)                                                     | GitHub Pages (static) / external hosting (optional)                                        | 🔴 Tier 4 |
| e2e-against-preview      | 🚚 Delivery      | **E2E against preview URL**                                                                                            | Playwright against deployed preview                                                        | 🔴 Tier 4 |
| docs-site                | 📚 Docs          | **Docs site generation/publish**                                                                                       | Docusaurus/Typedoc + GH Pages                                                              | 🟠 Tier 3 |
| adr-template             | 📚 Docs          | **Architecture Decision Records (ADR)**                                                                                | Markdown template + index generator                                                        | 🟡 Tier 2 |
| storybook                | 📚 Docs          | **Component workshop (Storybook)**                                                                                     | Storybook + build/publish + optional visual tests                                          | 🟠 Tier 3 |
| secrets-scan             | 🛡️ Security      | **Secret scanning in CI**                                                                                              | Gitleaks / TruffleHog (run in GH Actions)                                                  | 🟡 Tier 2 |
| vuln-scan                | 🛡️ Security      | **Dependency vulnerability scan (local-only)**                                                                         | `npm audit`/`pnpm audit`, OSV scanner                                                      | 🟠 Tier 3 |
| license-compliance       | 🛡️ Security      | **License compliance checks**                                                                                          | license-checker / pnpm licenses + allow/deny list                                          | 🟠 Tier 3 |
| sbom                     | 🛡️ Security      | **SBOM generation**                                                                                                    | CycloneDX/SPDX generators                                                                  | 🔴 Tier 4 |
| provenance-attest        | 🛡️ Security      | **Build provenance / attestations**                                                                                    | GitHub attestations / SLSA-style (advanced)                                                | 🔴 Tier 4 |
| ai-agent-interface       | 🤖 AI            | **Pluggable AI agent integration** — provider-agnostic interface                                                       | custom abstraction + model adapters; run in GH Actions                                     | 🔴 Tier 4 |
| ai-sandbox-policy        | 🤖 AI            | **AI sandbox/policy controls** — limit permissions/cost/scope                                                          | GH token scopes, job permissions, budget enforcement                                       | 🔴 Tier 4 |
| multi-branch-benchmark   | 🤖 AI            | **Multi-branch evaluation harness** — compare competing solutions                                                      | consistent workflows + metrics + baseline branch                                           | 🔴 Tier 4 |
| token-cost-accounting    | 🤖 AI            | **Token/cost accounting per PR**                                                                                       | provider usage logs, GH artifacts, PR summary                                              | 🔴 Tier 4 |
| scorecard                | 📈 Metrics       | **Scorecard summary** — single report: quality + perf + cost                                                           | custom generator to Markdown/HTML                                                          | 🟠 Tier 3 |

## Demo Project

### Client–Server Benchmark Foundation (TypeScript) — implemented

Lightweight but realistic client/server TypeScript monorepo for future CI + benchmarking experiments.

**What’s inside**

- `server`: TypeScript HTTP server with Replicache pull/push endpoints, deterministic demo seed, and 2 demo bots.
- `ui/web`: Vite + React + TypeScript + TailwindCSS + shadcn/ui-style UI with 3 behaviors:
  - No sync (purely local)
  - Full sync (push + pull)
  - Pull-only (local edits don’t push; still pulls server bot changes)

**Commands**

From repo root:

- `npm install`
- `npm run dev` — run server + web
- `DEMO_FREEZE_BOTS=1 npm run dev` — freeze server bots (useful for e2e)
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run format`

**Ports**

- Server: `http://localhost:8787`
- Web: `http://localhost:5173` (proxies `/api` to the server)

We are going to create a demo project to have a real subject for our ci

### Technical task for the demo project

Technical Specification (English)

1. Project Goal
   • Build a realistic but lightweight client–server TypeScript project to run future CI/benchmark experiments (install/build/test/e2e).
   • Support 3 data behaviors (no sync / full sync / pull only) inside one app.
   • Provide a deterministic demo mode with predictable initial data (for e2e and local demos).

⸻

2. Repository Structure
   • Root repository contains:
   • /server — backend (TypeScript).
   • /ui/web — frontend (React + TypeScript).
   • (reserved) /ui/tui — later, not now, but do not block future addition.
   • Shared root files:
   • .editorconfig, .gitignore, README.md
   • shared lint/format setup (e.g. ESLint + Prettier) reusable by both apps.
   • Package manager/runtime should be chosen to keep CI experiments easy (no unnecessary complexity).

⸻

3. Tech Stack

Frontend (ui/web)
• Vite + React + TypeScript
• TailwindCSS
• shadcn/ui
• Themes: light/dark + default “system”
• Mobile-first + responsive sidebar behavior

Backend (server)
• TypeScript HTTP server (any minimal framework is fine; prioritize simplicity/predictability)
• API endpoints required by Replicache (pull/push; auth/tenant can be simplified)

Sync
• Replicache as the primary client–server sync mechanism.

⸻

4. Domain Model
   • Project
   • id: string
   • name: string
   • Todo
   • id: string
   • projectId: string
   • text: string
   • completed: boolean
   • createdAt: number (timestamp)
   • updatedAt: number (timestamp)
   • optional: author: "client" | "bot" (useful for debugging/demo)

⸻

5. UI/UX Requirements

Layout
• Left sidebar + main content area.
• Mobile-first behavior:
• Desktop: sidebar open by default.
• Mobile: sidebar collapsed by default and opens as a sliding drawer.
• Sidebar content (top → bottom): 1. Theme toggle: System / Light / Dark (default System) 2. Menu: list of projects 3. Button: “Create project”
• Main content:
• Current project title
• Todo list (create/delete/edit/toggle completed)
• States: loading / empty / error
• “Professional, pleasant UI”:
• clean spacing/typography, proper hover/focus states
• smooth animations (sidebar open/close, todo add/remove, theme switching)
• Prefer shadcn/ui components (Button, Input, Dialog/Drawer, Dropdown, Toast, etc.)

⸻

6. Modes (3 Projects in Demo Mode)

In demo mode the app starts with 3 projects and prefilled data.

Project 1: “TodoList - no sync”
• Client loads a prefilled local Todo list on startup (frontend seed).
• User can:
• add/delete/edit todos
• toggle completed
• No server synchronization.
• State can live in client store; optional persistence (indexeddb/localStorage) but not required.

Project 2: “TodoList - full-sync”
• Full client–server sync via Replicache:
• client changes go to server (push)
• client receives server changes (pull)
• A server-side bot runs:
• every 5 seconds, performs one action on “its” todos:
• create a todo, or
• delete its todo, or
• toggle completed on a random todo
• Bot changes must appear on the client (via pull).

Project 3: “Todo - pull only”
• Client can create/edit todos locally, but does not push changes to the server (push disabled/ignored).
• Client still pulls updates from the server.
• A server-side bot runs:
• every 2 seconds, performs an action on the todos it can access:
• create / delete / edit text / toggle completed
• Client must see server changes, while local user changes remain local and do not affect the server.

⸻

7. Demo Mode
   • The app must support starting everything in demo mode via a single command.
   • In demo mode:
   • server + client run in compatible configuration
   • exactly 3 projects are created
   • each project’s initial todos are deterministic (fixed seed)
   • Demo mode must be stable for e2e:
   • same initial data each run
   • bots run on schedules (2s/5s)
   • ideally allow “freeze bots” via an env flag (optional but useful for tests)

⸻

8. Backend Requirements (Minimal)
   • Replicache endpoints:
   • POST /api/replicache/push
   • POST /api/replicache/pull
   • Storage:
   • in-memory is acceptable initially (keep it simple)
   • but design with an interface to later swap in SQLite/Postgres (optional now)
   • Bots:
   • Bot A for full-sync (5s)
   • Bot B for pull-only (2s)
   • Server must:
   • create initial seed for demo mode
   • return correct data via pull

⸻

9. Client Sync Requirements (Replicache)
   • Client:
   • create Replicache instance and bind it to the current project
   • subscribe/query Todos per project
   • Per mode behavior:
   • no sync: Replicache not used, or used locally with no network calls (either is fine as long as behavior matches)
   • full-sync: push + pull enabled
   • pull-only: push disabled/stubbed, pull enabled

⸻

10. Development Commands (Minimum)
    • dev — run server + ui/web together
    • dev:server — server only
    • dev:web — web only
    • build — build everything
    • test — unit tests (can be minimal/empty at first, but the command must exist)
    • lint / format — basic checks

⸻

11. E2E Foundation (Plan Ahead)
    • Demo mode is the default for e2e tests.
    • Add stable selectors (e.g. data-testid) for:
    • project list
    • create project button
    • add todo input
    • todo item (text, checkbox, delete)
    • Sync errors should be visible in the UI (toast/alert) so e2e can detect them.

⸻

12. Definition of Done
    • Repo with /server and /ui/web exists and runs locally.
    • Demo mode shows 3 projects with correct names.
    • Sidebar + theme toggle work; responsive behavior is correct (desktop open, mobile drawer).
    • Project 1 edits are local and not synced.
    • Project 2 is synced; bot modifies data every 5s; client sees updates.
    • Project 3 local edits do not push to server; server bot updates are pulled every 2s.
    • UI looks clean and includes basic animations (sidebar, list transitions).
