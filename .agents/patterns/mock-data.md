# mocks/ — Mock Data & MSW Handlers

## Package Identity

Mock data and MSW (Mock Service Worker) request handlers used by Storybook stories
and integration tests. Two layers: **mock-data** (static response payloads) and
**mock-server** (MSW handler functions).

## Directory Layout

| Directory              | Purpose                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `mock-data/`           | Static response payloads per domain (transactions, capital, disputes, etc.) |
| `mock-data/utils/`     | Mock data generation utilities                                              |
| `mock-data/payByLink/` | PayByLink-specific mock data                                                |
| `mock-server/`         | MSW request handlers per domain                                             |
| `mock-server/utils/`   | Handler utilities (response helpers, delay simulation)                      |
| `mock-server/setup.ts` | MSW worker setup and initialization                                         |

## Key Files

| File                       | Purpose                           |
| -------------------------- | --------------------------------- |
| `mock-server/index.ts`     | Aggregated handler exports        |
| `mock-server/setup.ts`     | MSW browser worker initialization |
| `mock-server/sessions.ts`  | Session/auth mock handlers        |
| `mock-server/analytics.ts` | Analytics endpoint mocks          |
| `mock-data/index.ts`       | Aggregated mock data exports      |

## Patterns & Conventions

### Mock Data

Each domain has a dedicated file exporting typed mock response objects:

```typescript
// ✅ Pattern: see mocks/mock-data/capital.ts
export const mockGrantsResponse = { data: [...], _links: {...} };
export const mockDynamicOfferConfig = { minAmount: {...}, maxAmount: {...} };
```

### MSW Handlers

Each domain has a handler file exporting arrays of MSW `http` handlers:

```typescript
// ✅ Pattern: see mocks/mock-server/capital.ts
import { http, HttpResponse } from 'msw';

export const capitalHandlers = [
    http.get('*/grants', () => HttpResponse.json(mockGrantsResponse)),
    http.get('*/dynamicOfferConfig', () => HttpResponse.json(mockDynamicOfferConfig)),
];
```

Stories compose handlers per scenario — see `stories/mocked/` for examples.

### Adding Mocks for a New Component

**Full scaffolding guide with detailed examples**: [stories-and-mocks.md](../scaffolding/stories-and-mocks.md)

1. Add mock response data in `mock-data/{domain}.ts`
2. Add MSW handlers in `mock-server/{domain}.ts`
3. Export from `mock-server/index.ts` and `mock-data/index.ts`
4. Use handlers in mocked stories via `parameters.msw.handlers`

## Common Gotchas

- **URL patterns**: Use `*` prefix in handler URLs (e.g., `*/grants`) to match both proxy and direct paths
- **Local assets**: When `VITE_LOCAL_ASSETS` is enabled, dataset fetches use `/datasets/` paths —
  mock both the API endpoint AND the local asset path for full coverage
- **Handler order matters**: MSW matches the first handler — put specific handlers before generic ones
- **Session mocks**: `mock-server/sessions.ts` provides minimal session auth mocks for Storybook
