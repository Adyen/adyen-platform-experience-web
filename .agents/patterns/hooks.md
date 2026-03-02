# Hooks Index

Check these hooks before creating new ones. Located in `src/hooks/`.

## Core Context

| Hook             | Path                             | Purpose                             |
| ---------------- | -------------------------------- | ----------------------------------- |
| `useCoreContext` | `core/Context/useCoreContext.ts` | Access i18n, loadingContext, config |

```typescript
const { i18n, loadingContext, commonProps } = useCoreContext();
```

## Data Fetching

| Hook          | Path           | Purpose                                |
| ------------- | -------------- | -------------------------------------- |
| `useFetch`    | `useFetch.ts`  | GET requests with loading/error states |
| `useMutation` | `useMutation/` | POST/PUT/DELETE operations             |

### useFetch

```typescript
import useFetch from '../../hooks/useFetch';

const { data, error, isLoading, refetch } = useFetch<ResponseType>({
    url: endpoints().resource.list,
    params: { limit: 10 },
    enabled: true, // Optional: conditional fetching
});
```

### useMutation

```typescript
import { useMutation } from '../../hooks/useMutation';

const { mutate, isLoading, error } = useMutation<RequestType, ResponseType>({
    url: endpoints().resource.create,
    method: 'POST',
    onSuccess: data => {
        /* handle success */
    },
    onError: error => {
        /* handle error */
    },
});

// Usage
mutate({ name: 'New Item', amount: 100 });
```

## Form Hooks

| Hook            | Path                           | Purpose                 |
| --------------- | ------------------------------ | ----------------------- |
| `useForm`       | `form/useForm.ts`              | Form state management   |
| `useWatch`      | `form/useWatch.ts`             | Watch form field values |
| `useWizardForm` | `form/wizard/useWizardForm.ts` | Multi-step form state   |

→ See [form-system.md](./form-system.md) for detailed usage.

## State Utilities

| Hook              | Path                 | Purpose                      |
| ----------------- | -------------------- | ---------------------------- |
| `useBooleanState` | `useBooleanState.ts` | Toggle state helper          |
| `useDefinedValue` | `useDefinedValue.ts` | Non-undefined value tracking |
| `useMounted`      | `useMounted.ts`      | Component mount status       |
| `useTrackedRef`   | `useTrackedRef.ts`   | Ref with change tracking     |

### useBooleanState

```typescript
import useBooleanState from '../../hooks/useBooleanState';

const [isOpen, { setTrue: open, setFalse: close, toggle }] = useBooleanState(false);

// Usage
<Button onClick={open}>Open Modal</Button>
<Modal isOpen={isOpen} onClose={close} />
```

### useMounted

```typescript
import useMounted from '../../hooks/useMounted';

const isMounted = useMounted();

// Safe async updates
const fetchData = async () => {
    const result = await api.get();
    if (isMounted()) {
        setData(result);
    }
};
```

## UI & Layout

| Hook                     | Path                        | Purpose                      |
| ------------------------ | --------------------------- | ---------------------------- |
| `useMediaQuery`          | `useMediaQuery.ts`          | Responsive breakpoints       |
| `useContainerQuery`      | `useContainerQuery.ts`      | Container-based responsive   |
| `useResponsiveContainer` | `useResponsiveContainer.ts` | Container responsive state   |
| `useUniqueId`            | `useUniqueId.ts`            | Unique IDs for accessibility |
| `useReflex`              | `useReflex.ts`              | Ref with callback            |

### useMediaQuery

```typescript
import useMediaQuery from '../../hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

### useUniqueId

```typescript
import useUniqueId from '../../hooks/useUniqueId';

const id = useUniqueId('input');
// → "input-abc123"

<label htmlFor={id}>Label</label>
<input id={id} />
```

## Data & Selection

| Hook                         | Path                            | Purpose                    |
| ---------------------------- | ------------------------------- | -------------------------- |
| `useBalanceAccounts`         | `useBalanceAccounts.ts`         | Balance accounts data      |
| `useBalanceAccountSelection` | `useBalanceAccountSelection.ts` | Account selection state    |
| `useAccountBalances`         | `useAccountBalances.ts`         | Account balances data      |
| `useStores`                  | `useStores.ts`                  | Stores data                |
| `useCustomColumnsData`       | `useCustomColumnsData.ts`       | Custom column handling     |
| `useTableColumns`            | `useTableColumns.ts`            | Table column configuration |

### useBalanceAccounts

```typescript
import useBalanceAccounts from '../../hooks/useBalanceAccounts';

const { balanceAccounts, isLoading, error } = useBalanceAccounts();
```

## Filters & Navigation

| Hook                             | Path                                | Purpose                   |
| -------------------------------- | ----------------------------------- | ------------------------- |
| `useDefaultOverviewFilterParams` | `useDefaultOverviewFilterParams.ts` | Default filter values     |
| `useMultiSelectionFilterProps`   | `useMultiSelectionFilterProps.ts`   | Multi-select filter state |
| `usePaymentLinkFilters`          | `usePaymentLinkFilters.ts`          | Payment link filters      |
| `useTabbedControl`               | `useTabbedControl.ts`               | Tab state management      |

### useTabbedControl

```typescript
import useTabbedControl from '../../hooks/useTabbedControl';

const { activeTab, setActiveTab, tabs } = useTabbedControl({
    tabs: ['overview', 'details', 'history'],
    defaultTab: 'overview',
});
```

## Formatting & Display

| Hook                             | Path                                | Purpose                  |
| -------------------------------- | ----------------------------------- | ------------------------ |
| `useTimezoneAwareDateFormatting` | `useTimezoneAwareDateFormatting.ts` | Timezone date formatting |
| `useImageUrl`                    | `useImageUrl.ts`                    | Image URL resolution     |
| `useComponentHeadingElement`     | `useComponentHeadingElement.ts`     | Dynamic heading level    |

### useTimezoneAwareDateFormatting

```typescript
import useTimezoneAwareDateFormatting from '../../hooks/useTimezoneAwareDateFormatting';

const { formatDate, formatDateTime } = useTimezoneAwareDateFormatting();

formatDate('2024-01-15T10:30:00Z'); // → "Jan 15, 2024"
```

## Timing & Performance

| Hook                 | Path                    | Purpose                       |
| -------------------- | ----------------------- | ----------------------------- |
| `useComponentTiming` | `useComponentTiming.ts` | Component render timing       |
| `useFreezePeriod`    | `useFreezePeriod.ts`    | Prevent updates during period |

## Modal & Details

| Hook              | Path               | Purpose                |
| ----------------- | ------------------ | ---------------------- |
| `useModalDetails` | `useModalDetails/` | Modal detail state     |
| `useCommitAction` | `useCommitAction/` | Commit/confirm actions |

## Analytics

| Hook           | Path            | Purpose            |
| -------------- | --------------- | ------------------ |
| `useAnalytics` | `useAnalytics/` | Analytics tracking |

## Element Hooks

Located in `src/hooks/element/`:

| Hook            | Purpose           |
| --------------- | ----------------- |
| `useElement`    | Element lifecycle |
| `useElementRef` | Element reference |

## Reactive State

Located in `src/primitives/reactive/`:

| Hook               | Purpose                   |
| ------------------ | ------------------------- |
| `useReactiveState` | Reactive state management |

## Creating New Hooks

If you need a hook that doesn't exist:

1. Check if existing hooks can be composed
2. Create in `src/hooks/useHookName.ts`
3. Add tests: `useHookName.test.ts`
4. Follow naming convention: `use{Purpose}`

### Hook Template

```typescript
import { useState, useCallback, useEffect } from 'preact/hooks';

interface UseMyHookOptions {
    initialValue?: string;
    onChange?: (value: string) => void;
}

interface UseMyHookReturn {
    value: string;
    setValue: (value: string) => void;
    reset: () => void;
}

const useMyHook = (options: UseMyHookOptions = {}): UseMyHookReturn => {
    const { initialValue = '', onChange } = options;
    const [value, setValueState] = useState(initialValue);

    const setValue = useCallback(
        (newValue: string) => {
            setValueState(newValue);
            onChange?.(newValue);
        },
        [onChange]
    );

    const reset = useCallback(() => {
        setValueState(initialValue);
    }, [initialValue]);

    return { value, setValue, reset };
};

export default useMyHook;
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/preact';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
    test('should initialize with default value', () => {
        const { result } = renderHook(() => useMyHook());
        expect(result.current.value).toBe('');
    });

    test('should update value', () => {
        const { result } = renderHook(() => useMyHook());
        act(() => {
            result.current.setValue('new value');
        });
        expect(result.current.value).toBe('new value');
    });
});
```
