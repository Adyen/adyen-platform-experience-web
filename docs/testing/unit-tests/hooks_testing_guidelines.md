# Testing Guidelines - Hooks

## Analysis Phase (Required)

Before writing any tests, analyze the hook and document:

1. **Purpose**: What problem does this hook solve?
2. **State Management**: What state does it manage? Initial values?
3. **Exposed API**: What functions/methods does it return?
4. **Side Effects**: Timers, subscriptions, network calls, async operations?
5. **Callbacks**: What callbacks/options does it accept? When are they called?
6. **Error Handling**: How does it handle errors? Retry mechanisms?
7. **Cleanup**: What happens on unmount? Cleanup functions?
8. **Edge Cases**: Race conditions, timing issues, boundary conditions?
9. **Dependencies**: What triggers re-execution? What's memoized?

**Stop here and wait for confirmation before writing tests.**

## Test Behavior, Not Implementation

Red flags that you're testing implementation:

- Spying on setTimeout or setImmediate to verify timing
- Checking internal variable values not exposed in API
- Testing that Preact hooks (useEffect, useCallback) are called
- Verifying order of internal function calls
- Mocking internal functions to verify they're called
- Need complex mocking to make test work
- Test breaks when you refactor but behavior doesn't change

## Hook Test Checklist

### Initial State

- Returns correct initial values
- Handles initial parameters correctly
- Default values work as expected

### State Updates

- Updates state when functions are called
- Handles multiple sequential updates
- State persists across re-renders

### Side Effects

- Side effects are triggered correctly
- State updates when dependencies change
- Cleanup logic tears down side effects on unmount

### Error Handling

- Handles errors gracefully
- Sets error state correctly
- Recovers from errors

### Edge Cases

- Handles null/undefined inputs
- Handles rapid successive calls
- Handles unmounting during async operations

## Common Patterns

### Object-Level Assertions

Prefer testing the entire returned object:

```typescript
expect(result.current).toEqual({
    timezone: 'UTC',
    clockTime: '04:10 PM',
    GMTOffset: '',
    timestamp: SYSTEM_TIMESTAMP,
});
```

### Data-Driven Testing

Extract reusable test data as constants. Use `forEach` loops over `test.each()`:

```typescript
const TIMEZONE_DATA = [
    {
        timezone: 'America/New_York',
        winter: { date: '12/25/2023', fullDate: 'Dec 25, 2023, 11:10:45' },
        summer: { date: '07/08/2023', fullDate: 'Jul 08, 2023, 12:10:45' },
    },
    {
        timezone: 'Europe/London',
        winter: { date: '12/25/2023', fullDate: 'Dec 25, 2023, 16:10:45' },
        summer: { date: '07/08/2023', fullDate: 'Jul 08, 2023, 17:10:45' },
    },
];

test('should format dates correctly across DST and non-DST timezones', () => {
    TIMEZONE_DATA.forEach(({ timezone, winter, summer }) => {
        const { result } = renderHook(() => useTimezoneAwareDateFormatting(timezone));
        expect(result.current.dateFormat(WINTER_TIMESTAMP)).toBe(winter.date);
        expect(result.current.dateFormat(SUMMER_TIMESTAMP)).toBe(summer.date);
    });
});
```

### Function Reference Stability

```typescript
test('should return stable function references when dependencies do not change', () => {
    const { result, rerender } = renderHook(() => useHook('value'));
    const { fn1, fn2 } = result.current;

    rerender();

    expect(result.current.fn1).toBe(fn1);
    expect(result.current.fn2).toBe(fn2);
});
```

### System-Dependent Testing

Calculate expected values from system behavior:

```typescript
test('should handle nullish timezones gracefully', () => {
    const currentTime = Date.now();
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' } as const;
    const systemTimezoneFormat = new Intl.DateTimeFormat('en-US', {
        ...formatOptions,
        timeZone: systemTimezone,
    }).format(currentTime);

    const { result } = renderHook(() => useTimezoneAwareDateFormatting());
    expect(result.current.dateFormat(currentTime, formatOptions)).toBe(systemTimezoneFormat);
});
```

### Async Timer Testing

```typescript
test('should handle time advancement', async () => {
    const { result } = renderHook(() => useTimer());
    const initialTimestamp = result.current.timestamp;

    await vi.advanceTimersByTimeAsync(5000);

    expect(result.current.timestamp).toBe(initialTimestamp + 5000);
});
```

## File Structure

```typescript
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import useHook from './useHook';

describe('useHook', () => {
    const mockUseCoreContext = vi.mocked(useCoreContext);

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123);
        vi.clearAllMocks();
        mockUseCoreContext.mockReturnValue({ i18n: new Localization().i18n } as any);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should handle timezone formatting', () => {
        const WINTER_TIMESTAMP = 1703520645123;
        // test logic
    });
});
```

## Anti-Patterns

### Avoid Test Repetition

Don't create multiple tests for the same behavior. Consolidate:

```typescript
// Good: Single test with data-driven approach
test('should handle nullish timezones gracefully', () => {
    const { result: nullResult } = renderHook(() => useHook(null as any));
    const { result: undefinedResult } = renderHook(() => useHook(undefined));
    const { result: noParamResult } = renderHook(() => useHook());

    expect(nullResult.current.value).toBe(expectedFormat);
    expect(undefinedResult.current.value).toBe(expectedFormat);
    expect(noParamResult.current.value).toBe(expectedFormat);
});
```

### Code Style

- Use consistent formatting with trailing commas
- Simple arrays stay inline, complex ones get expanded
- Keep variable names descriptive and purpose-driven

## Quality Checklist

- Analysis phase completed and confirmed
- All assertions use concrete values (no typeof, toMatch, toContain)
- Testing behavior, not implementation
- Common setup in beforeEach, test-specific constants in test functions
- Edge cases covered with concrete expectations
- Async operations properly awaited
- Mocks cleared between tests
- Coverage meets 85% minimum
