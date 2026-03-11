# AGENTS.md — Adyen Platform Experience Web

## Project Snapshot

Single-package **Preact** component library (`@adyen/adyen-platform-experience-web`) published to npm.
Stack: Preact + TypeScript (strict) + Vite + SCSS (BEM) + Storybook.
All agent documentation lives under `.agents/` — check the JIT Index below for the right file.

## Root Setup Commands

```bash
pnpm install                # Install dependencies
pnpm run build              # Build library (ES + CJS output)
pnpm run types:check        # TypeScript strict type-check
pnpm run lint               # ESLint + Stylelint
pnpm run test               # Vitest unit tests (watch mode)
pnpm run test:integration   # Playwright integration tests (needs Storybook build)
pnpm run storybook          # Dev server (Storybook + type watcher)
pnpm run format             # Prettier format src/
```

## Universal Conventions

- **TypeScript strict** with `noUncheckedIndexedAccess` — all index access returns `T | undefined`
- **Prettier**: 4-space indent, single quotes, 150 char print width, trailing commas `es5`
- **ESLint**: `react/jsx-no-literals` enforced — never inline raw string literals in JSX
- **Stylelint**: SCSS only, extends `stylelint-config-sass-guidelines`
- **CSS classes**: `adyen-pe-` prefix, BEM-like (`block__element--modifier`), defined in `constants.ts` files
- **Commits**: `type(scope): subject` — Conventional Commits with required scope
- **Branches**: `bug/` prefix for fixes, `feature/` for new functionality
- **PRs**: Fork → branch from `develop` → PR with description → all CI checks must pass
- **a11y**: ESLint `jsx-a11y` rules enforced — ARIA attributes, keyboard nav, semantic HTML required
- **Imports**: Preact only (`preact`, `preact/hooks`, `preact/compat`) — never import from `react`
- **Data flow**: Data flows **down** via props; events flow **up** via callbacks. Shared runtime (i18n, loading context, CDN config) is accessed through `useCoreContext()`, never passed as props between siblings.

## Security & Secrets

- **Never** commit API keys, tokens, or credentials
- Copy `envs/env.default` → `envs/env.local` (gitignored) for local dev
- `API_KEY` and `SESSION_ACCOUNT_HOLDER` go in `envs/env.local`
- Session auth is handled internally by `src/core/ConfigContext/session/`

## Architecture Overview

External components follow a layered render chain:

```
BaseElement → UIElement → ComponentNameElement → Container → Presentational
```

- **`BaseElement`** — Base class handling mounting/unmounting into the host DOM (`mount()`, `unmount()`, `update()`).
- **`UIElement`** — Extends `BaseElement`, wraps `componentToRender()` in the provider stack: `ConfigProvider` → `CoreProvider` → `AnalyticsProvider`.
- **`ComponentNameElement`** — Thin subclass that sets the component `type` and points `componentToRender` at its container.
- **Container** (`ComponentNameContainer`) — Owns data fetching, state, and orchestration logic. Delegates rendering to presentational children.
- **Presentational** (`ComponentName`) — Pure UI; receives data and callbacks via props.

→ **Details**: [.agents/patterns/component-architecture.md](.agents/patterns/component-architecture.md)

## Critical Rules

### i18n — NEVER Hardcode Strings

All user-facing text must use the i18n system from `useCoreContext()`:

```typescript
const { i18n } = useCoreContext();

i18n.get('translation.key')              // Text
i18n.get('key', { values: { n: 5 } })    // With interpolation
i18n.amount(1234, 'EUR')                 // Currency: €12.34
i18n.date(date)                          // Date formatting
i18n.fullDate(date)                      // Date with time
```

→ **Details**: [.agents/patterns/i18n.md](.agents/patterns/i18n.md)

### Translation Workflow

- Translation files live under `src/assets/translations/*.json`
- Keep translation JSON sorted: `pnpm run translations:sort`

### Bug fixes

When I report a bug, don't start by trying to fix it. Instead, start by writing a test that reproduces the bug. Then, try to fix the bug and prove it with a passing test.

### Styling with Bento Design Tokens

Never hardcode pixel values. Use design tokens:

```scss
// ❌ Wrong
padding: 8px;
margin: 5px;

// ✅ Correct
padding: style.token(spacer-040);  // 8px
margin: style.token(spacer-030);   // 6px
```

→ **Details**: [.agents/patterns/design-tokens.md](.agents/patterns/design-tokens.md)

### API Types

Types auto-generated from OpenAPI specs:
- **Location**: `src/types/api/resources/`
- **Regenerate**: `pnpm run schemas:generate`
- **Endpoints**: `endpoints/endpoints.ts`
- Do **not** edit generated files in `src/types/api/resources/` manually
- Do **not** use `any` or hand-written interfaces for API data — always import generated types

### Internal Components — Don't Reinvent

Always check existing internal components before creating new UI primitives.
Use `Button`, `Modal`, `DataGrid`, `Alert`, etc. from `src/components/internal/`.

→ **Full index**: [.agents/patterns/internal-components.md](.agents/patterns/internal-components.md)

### Pre-Push Checks

Run this minimum set before pushing:

```bash
pnpm run lint && pnpm run test -- --run && pnpm run build
```

Optional (slower, useful for larger UI/API changes):

```bash
pnpm run test:integration
```

## JIT Index

### Directory Map

| Topic | File |
|-------|------|
| Source overview & conventions | [source-overview.md](.agents/patterns/source-overview.md) |
| Component architecture | [component-architecture.md](.agents/patterns/component-architecture.md) |
| Custom hooks | [hooks.md](.agents/patterns/hooks.md) |
| Core runtime | [core-runtime.md](.agents/patterns/core-runtime.md) |
| Design tokens (Bento) | [design-tokens.md](.agents/patterns/design-tokens.md) |
| i18n patterns | [i18n.md](.agents/patterns/i18n.md) |
| Internal components index | [internal-components.md](.agents/patterns/internal-components.md) |
| Storybook stories | [storybook.md](.agents/patterns/storybook.md) |
| Mock data & MSW handlers | [mock-data.md](.agents/patterns/mock-data.md) |
| Scaffolding: external component | [external-component.md](.agents/scaffolding/external-component.md) |
| Scaffolding: stories & mocks | [stories-and-mocks.md](.agents/scaffolding/stories-and-mocks.md) |
| Integration, e2e, contract tests | [integration-and-e2e.md](.agents/testing/integration-and-e2e.md) |
| Unit test guidelines | [unit-tests/](.agents/testing/unit-tests/) |

### Key Config Files

- **Vite**: `vite.config.ts` — build, dev server, test config
- **TypeScript**: `tsconfig.json` (dev), `tsconfig-build.json` (build)
- **Playwright**: `playwright.config.ts` — integration/e2e/contract projects
- **Storybook**: `.storybook/main.ts` — Storybook config
- **API endpoints**: `endpoints/endpoints.ts`
- **Env defaults**: `envs/env.default`

### Quick Find Commands

```bash
rg -n "export class.*Element" src/components/external/       # External component elements
rg -n "export.*function use" src/hooks/                       # Custom hooks
rg -n "adyen-pe-" src/ -g "constants.ts"                     # CSS class constants
rg -n "export.*type|export.*interface" src/types/             # Shared API types
fd "*.test.ts" src/                                           # Unit tests
fd "*.spec.ts" tests/                                         # Integration/e2e specs
```
