# src/ — Library Source

## Package Identity

Main source for `@adyen/adyen-platform-experience-web`. Exports external components, core runtime,
hooks, and shared types. Entry point: `index.ts` → exports `AdyenPlatformExperience` factory function.

## Directory Layout

| Directory              | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `components/external/` | Public components exposed to consumers (Element classes)               |
| `components/internal/` | Reusable UI primitives (Button, Modal, DataGrid, Calendar, etc.)       |
| `components/utils/`    | Component utility functions                                            |
| `core/`                | Core runtime: session, config, localization, analytics, HTTP           |
| `hooks/`               | Shared custom hooks (useFetch, useMutation, useBalanceAccounts, etc.)  |
| `primitives/`          | Low-level utilities: async, reactive state, time, context helpers      |
| `types/`               | Shared TypeScript types, primarily `types/api/` for API models         |
| `utils/`               | General utilities: abort, collection, currency, datetime, file, random |
| `style/`               | Global SCSS: design tokens, accessibility, CSS custom properties       |
| `assets/`              | Static assets: images, datasets (countries), translation JSON files    |
| `translations/`        | i18n translation loading and locale management                         |
| `declarations/`        | TypeScript ambient declarations                                        |

## Patterns & Conventions

### File Organization

- Each component/hook gets its own directory with colocated files:
  `ComponentName/`, `ComponentName.tsx`, `ComponentName.scss`, `constants.ts`, `types.ts`
- Unit tests are colocated: `useHook.ts` + `useHook.test.ts` in the same directory
- CSS class names live in `constants.ts` as object maps — never inline class strings

### Naming

- External components: `{Name}Element.tsx` (class extending `UIElement`)
- Internal components: PascalCase directory and file names
- Hooks: `use{Name}.ts` with colocated `use{Name}.test.ts`
- Types: `types.ts` within each component directory; shared in `src/types/`

### Critical Rules

- **No React imports** — use `preact`, `preact/hooks`, `preact/compat` only
- **No raw string literals in JSX** — use `i18n.get()` for all text. See [i18n patterns](i18n.md)
- **All index access returns `T | undefined`** — `noUncheckedIndexedAccess` enabled
- **Design tokens**: use `@adyen/bento-design-tokens` via SCSS `style.token()` — never hardcode colors/spacing. See [design-tokens.md](design-tokens.md)

### CSS Class Pattern

Classes use `adyen-pe-` prefix with BEM structure, defined in `constants.ts`:

```typescript
// ✅ DO: Object map in constants.ts (see src/components/external/CapitalOverview/constants.ts)
export const CAPITAL_OVERVIEW_CLASS_NAMES = {
    base: 'adyen-pe-capital-overview',
    title: 'adyen-pe-capital-overview__title',
    skeleton: 'adyen-pe-capital-overview__skeleton',
};

// ✅ DO: Use cx() from classnames for conditional classes
import cx from 'classnames';
<div className={cx(CLASS_NAMES.base, { [CLASS_NAMES.active]: isActive })} />

// ❌ DON'T: Inline class strings in JSX
<div className="adyen-pe-capital-overview" />
```

## Touch Points

- **Library entry**: `src/index.ts` — `AdyenPlatformExperience()` factory
- **Component exports**: `src/components/external/index.ts`
- **Shared types**: `src/types/api/` — API model interfaces
- **Global styles**: `src/style/index.scss` — design tokens and CSS variables
- **Translations**: `src/assets/translations/en-US.json` (default locale)

## Pre-PR Checks

```bash
pnpm run types:check && pnpm run lint && pnpm run test -- --run
```
