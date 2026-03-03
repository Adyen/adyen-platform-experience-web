# stories/ — Storybook Stories

## Package Identity

Storybook stories for developing and testing external components. Three tiers:
**api** (real API), **mocked** (MSW mock data), and **components** (shared story components).

## Directory Layout

| Directory     | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `api/`        | Stories using real API calls (requires `envs/env.local` with credentials) |
| `mocked/`     | Stories with MSW mock handlers — used by integration tests                |
| `components/` | Shared story wrapper components (reused across api/mocked)                |
| `utils/`      | Story utilities: `Container.tsx`, `controls.ts`, `sessionRequest.js`      |

## Running Storybook

```bash
pnpm run storybook           # Dev server with hot reload + type watcher
pnpm run storybook:build     # Build static Storybook (for CI/deployment)
pnpm run storybook:static    # Build + serve for integration test preview
```

## Patterns & Conventions

### Story File Naming

- API stories: `stories/api/{componentName}.stories.tsx`
- Mocked stories: `stories/mocked/{componentName}.stories.tsx`
- Component wrappers: `stories/components/{componentName}.tsx`

### Mocked Stories (Integration Test Targets)

Mocked stories configure MSW handlers for specific scenarios. Integration tests
navigate to these stories via Storybook URLs.

```typescript
// ✅ Pattern: see stories/mocked/capitalOverview.stories.tsx
export const GrantActive = {
    parameters: {
        msw: {
            handlers: [
                // MSW request handlers from mocks/mock-server/
            ],
        },
    },
};
```

### Story Utilities

- **`Container.tsx`** — Wrapper component that initializes `AdyenPlatformExperience` core
- **`controls.ts`** — Shared Storybook control definitions
- **`sessionRequest.js`** — Session creation helper for API stories
- **`types.ts`** — Shared story type definitions

### Adding a New Story

**Full scaffolding guide with detailed examples**: [stories-and-mocks.md](../scaffolding/stories-and-mocks.md)

1. Create component wrapper in `stories/components/{name}.tsx`
2. Create mocked story in `stories/mocked/{name}.stories.tsx` with MSW handlers
3. Optionally create API story in `stories/api/{name}.stories.tsx`
4. Mock data goes in `mocks/mock-data/`, handlers in `mocks/mock-server/`

## Common Gotchas

- **API stories require credentials** — set `API_KEY` and `SESSION_ACCOUNT_HOLDER` in `envs/env.local`
- **MSW handlers must cover all endpoints** the component calls, or requests will fail silently
- **Integration tests target mocked stories** — if you change a mocked story, verify integration tests still pass
- **CDN assets**: In test/dev mode, assets load locally (`VITE_LOCAL_ASSETS`); in production, from CDN
