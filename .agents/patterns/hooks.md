# src/hooks/ — Custom Hooks

## Package Identity

Shared custom hooks used across external components. Includes data fetching (`useFetch`),
mutations (`useMutation`), form handling, analytics, and UI state management.

## Directory Layout

- **Top-level hooks**: `use{Name}.ts` + `use{Name}.test.ts` colocated in this directory
- **Complex hooks**: Own subdirectory — e.g., `useMutation/`, `useReactiveState/`, `useAnalytics/`
- **Component-specific hooks**: Live in their component directory, not here
  (e.g., `src/components/external/TransactionsOverview/hooks/`)

## Key Hooks

| Hook                             | Purpose                              | File                                |
| -------------------------------- | ------------------------------------ | ----------------------------------- |
| `useFetch`                       | Data fetching with `queryFn` pattern | `useFetch.ts`                       |
| `useMutation`                    | Mutations with retry, callbacks      | `useMutation/useMutation.ts`        |
| `useBalanceAccounts`             | Balance account data                 | `useBalanceAccounts.ts`             |
| `useBalanceAccountSelection`     | Balance account picker state         | `useBalanceAccountSelection.ts`     |
| `useStores`                      | Store data management                | `useStores.ts`                      |
| `useTabbedControl`               | Tab navigation state                 | `useTabbedControl.ts`               |
| `useTableColumns`                | DataGrid column config               | `useTableColumns.ts`                |
| `useTimezoneAwareDateFormatting` | Timezone-safe date display           | `useTimezoneAwareDateFormatting.ts` |
| `useContainerQuery`              | Container query responsive           | `useContainerQuery.ts`              |
| `useMediaQuery`                  | Media query hook                     | `useMediaQuery.ts`                  |

## Patterns

### Data Fetching — `useFetch`

```typescript
// ✅ Pattern: queryFn-based fetching (see src/hooks/useFetch.ts)
const { data, error, isFetching, refetch } = useFetch({
    queryFn: () => session.context.endpoints.getTransactions(params),
    fetchOptions: { enabled: !!balanceAccountId, keepPrevData: true },
});
```

- Returns `{ data, error, isFetching, refetch }`
- `isFetching` (not `isLoading`) — this is the canonical naming
- `enabled` controls whether the fetch executes
- `queryFn` receives no arguments — closure over params

### Mutations — `useMutation`

```typescript
// ✅ Pattern: mutation with callbacks (see src/hooks/useMutation/useMutation.ts)
const { mutate, isLoading, isError, data, reset } = useMutation({
    queryFn: session.context.endpoints.createPaymentLink,
    options: {
        onSuccess: data => handleSuccess(data),
        onError: error => handleError(error),
        retry: 2,
        retryDelay: 1000,
    },
});
```

- Returns `{ data, error, status, isIdle, isLoading, isSuccess, isError, mutate, reset }`
- Supports `retry`, `retryDelay`, `shouldRetry` for resilience

### Hook Conventions

- **Always import from `preact/hooks`** — never from `react`
- **Colocate tests**: `useHook.ts` → `useHook.test.ts` in the same directory
- **Prefix with `use`**: Follow React/Preact hook naming convention
- **Return stable references**: Use `useCallback`/`useMemo` for returned functions

## Testing

Detailed testing guidelines: `.agents/testing/unit-tests/hooks_testing_guidelines.md`

```bash
# Run a specific hook test
pnpm run test -- --run useBalanceAccounts

# Run all hook tests
pnpm run test -- --run src/hooks/
```

## Common Gotchas

- `useFetch` uses `isFetching` not `isLoading` — be consistent
- `useMutation` uses `isLoading` — different from `useFetch`
- Component-specific hooks belong in the component dir, not in `src/hooks/`
- Context access: use `useCoreContext()` for i18n, assets — see `src/core/Context/CoreProvider.tsx`
