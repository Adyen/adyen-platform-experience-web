# AGENTS.md

Adyen Platform Experience Web - Preact component library providing embeddable financial dashboard components for platform customers.

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

Data flows **down** via props; events flow **up** via callbacks. Shared runtime (i18n, loading context, CDN config) is accessed through `useCoreContext()`, never passed as props between siblings.

## Stack

- **Framework**: Preact (NOT React) + TypeScript
- **Build**: Vite
- **Stories**: Storybook 10
- **Testing**: Vitest + @testing-library/preact + Playwright
- **Styling**: SCSS + Bento design tokens
- **Package Manager**: pnpm

## Quick Commands

```bash
pnpm start                 # Storybook dev server (localhost:3030)
pnpm test                  # Unit tests (Vitest)
pnpm run test:integration  # Playwright integration tests
pnpm run lint              # ESLint + Stylelint
pnpm run schemas:generate  # Regenerate OpenAPI types
```

## Local Setup (First Run)

1. Create `envs/.env` based on `envs/env.default` and fill in required values.
2. Install dependencies:

```bash
pnpm install
```

3. Start Storybook:

```bash
pnpm start
```

## Critical Rules

### i18n - NEVER Hardcode Strings

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

### Before Creating Components

Check `src/components/internal/` first. 50+ components available:

| Category | Components |
|----------|------------|
| **Forms** | InputBase, InputText, Select, Checkbox, TextArea, DatePicker |
| **Layout** | Card, Modal, Accordion, Tabs, Divider |
| **Data** | DataGrid, StructuredList, Pagination, FilterBar |
| **Feedback** | Alert, Spinner, StatusBox, Tooltip, InfoBox |
| **Actions** | Button, Link, AnchorButton, CopyText |

→ **Full Index**: [.agents/patterns/internal-components.md](.agents/patterns/internal-components.md)

### Before Creating Hooks

Check `src/hooks/` first. 30+ hooks available:

| Hook | Purpose |
|------|---------|
| `useCoreContext()` | i18n, loadingContext, config |
| `useFetch()` | GET requests with loading/error states |
| `useMutation()` | POST/PUT/DELETE operations |
| `useBooleanState()` | Toggle state helper |
| `useMounted()` | Component mount status |
| `useForm()` | Form state management |
| `useWizardForm()` | Multi-step form flows |
| `useMediaQuery()` | Responsive breakpoints |
| `useUniqueId()` | Accessible unique IDs |

→ **Full Index**: [.agents/patterns/hooks.md](.agents/patterns/hooks.md)

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

Tokens defined in `src/style/bento/`.

### CSS Class Naming Convention

All CSS classes use the `adyen-pe-` prefix with a BEM-like structure:

```
adyen-pe-{block}__{element}--{modifier}
```

- **Block** — Component name in kebab-case: `adyen-pe-capital-overview`
- **Element** — Child part, separated by `__`: `adyen-pe-capital-overview__title`
- **Modifier** — Variant/state, separated by `--`: `adyen-pe-dispute-data--mobile`

Define classes in a `constants.ts` file per component. Two accepted patterns:

```typescript
// Pattern 1: Object map (preferred for components with many classes)
export const CLASS_NAMES = {
    base: 'adyen-pe-grant-item',
    alert: 'adyen-pe-grant-item__alert',
    cardContent: 'adyen-pe-grant-item__card-content',
    textSecondary: 'adyen-pe-grant-item__text--secondary',
};

// Pattern 2: Individual constants (works well with BEM block/element/modifier grouping)
const BASE_CLASS = 'adyen-pe-expandable-card';
export const CONTAINER_CLASS = BASE_CLASS + '__container';
export const CONTAINER_FILLED_CLASS = CONTAINER_CLASS + '--filled';
```

```typescript
// ❌ Wrong - Inline class strings, no prefix, no constants file
<div className="my-component">
<div className="content-wrapper">

// ✅ Correct - Import from constants, adyen-pe- prefix
import { CLASS_NAMES } from './constants';
<div className={CLASS_NAMES.base}>
```

Use `cx()` (classnames) for conditional classes:

```typescript
import cx from 'classnames';
<div className={cx(CLASS_NAMES.base, { [CLASS_NAMES.mobile]: isMobile })} />
```

## Project Structure

```
src/
├── components/
│   ├── external/       # Public components (extend UIElement)
│   │   ├── TransactionsOverview/
│   │   ├── PaymentLinkCreation/
│   │   └── ...
│   └── internal/       # Shared UI primitives (50+ components)
├── core/
│   ├── Context/        # CoreContext, useCoreContext
│   └── Localization/   # i18n implementation
├── hooks/              # Reusable hooks (30+)
│   └── form/           # Form system (useForm, Controller, useWizardForm)
├── primitives/         # Low-level utilities
├── types/api/          # OpenAPI-generated types
├── translations/       # i18n types
└── style/bento/        # Design tokens

mocks/
├── mock-data/          # Static mock data
└── mock-server/        # MSW handlers

stories/
├── components/         # Story metadata
├── mocked/             # MSW-mocked stories
└── api/                # Real API stories

endpoints/
└── endpoints.ts        # API endpoint definitions
```

## Scaffolding

### New External Component
→ [.agents/scaffolding/external-component.md](.agents/scaffolding/external-component.md)

### Stories & Mock Server
→ [.agents/scaffolding/stories-and-mocks.md](.agents/scaffolding/stories-and-mocks.md)

## Form System

- **Simple forms**: `useForm()` + `Controller`
- **Multi-step wizards**: `useWizardForm()` + `WizardFormProvider`

→ **Details**: [.agents/patterns/form-system.md](.agents/patterns/form-system.md)

## Testing

Unit tests are co-located with source files:
- `Component.test.tsx` next to `Component.tsx`
- `useHook.test.ts` next to `useHook.ts`

→ **Guidelines**: [.agents/testing/unit-tests/](.agents/testing/unit-tests/)

### Local Pre-PR Checks

Run this minimum set before pushing:

```bash
pnpm run lint
pnpm test
pnpm run build
```

Optional (slower, useful for larger UI/API changes):

```bash
pnpm run test:integration
```

## API Types

Types auto-generated from OpenAPI specs:
- Location: `src/types/api/resources/`
- Regenerate: `pnpm run schemas:generate`
- Endpoints: `endpoints/endpoints.ts`
- Do not edit generated files in `src/types/api/resources/` manually.

## Translation Workflow

- All user-facing text must use i18n keys.
- Translation files live under `src/**/translations/*.json`.
- Keep translation JSON sorted:

```bash
pnpm run translations:sort
```

## API Patterns

### GET Requests

```typescript
const { data, error, isFetching, refetch } = useFetch({
  queryFn: () => http.get(endpoint, params),
  fetchOptions: {
    enabled: true,           // Control when to fetch
    keepPrevData: true,      // Keep previous data while refetching
    onSuccess: (data) => {}, // Callback on success
  },
});
```

### Mutations (POST/PUT/DELETE)

```typescript
const { mutate, isLoading, isError, error, reset } = useMutation({
  queryFn: (payload) => http.post(endpoint, payload),
  options: {
    onSuccess: (data) => {},
    onError: (error) => {},
    onSettled: (data, error) => {},
    retry: 3,                // Number of retries
    retryDelay: 1000,        // Delay between retries (ms)
  },
});

// Trigger mutation
await mutate(payload);
```

### Error Handling

```typescript
// Errors are typed as Error | AdyenErrorResponse
if (error) {
  // AdyenErrorResponse has: errorCode, errorType, message, status
  const message = error.message;
  const errorCode = 'errorCode' in error ? error.errorCode : undefined;
}
```

## Common Mistakes

### Types

```typescript
// ❌ Wrong - Using `any` or manual types
const data: any = response;
interface Transaction { id: string; amount: number; }

// ✅ Correct - Use generated API types
import { Transaction } from 'src/types/api/resources/transactions';
```

### Styling

```scss
// ❌ Wrong - Hardcoded values
.container {
  padding: 8px;
  margin-top: 10px;
}

// ✅ Correct - Bento design tokens
.container {
  padding: style.token(spacer-040);
  margin-top: style.token(spacer-050);
}
```

### Components

```typescript
// ❌ Wrong - Creating custom button/input/modal
const MyButton = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

// ✅ Correct - Use internal components
import { Button } from 'src/components/internal/Button';
import { Modal } from 'src/components/internal/Modal';
```