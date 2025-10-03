# Testing Guidelines - Hooks

## Analysis Phase (Required)

**Before writing any tests**, thoroughly analyze the hook and document your understanding. This prevents misunderstandings and wasted effort.

### Required Analysis Points

1. **Purpose**: What problem does this hook solve?
2. **State Management**: What state does it manage? What are the initial values?
3. **Exposed API**: What functions/methods does it return?
4. **Side Effects**: Does it use timers, subscriptions, network calls, or other async operations?
5. **Callbacks**: What callbacks/options does it accept? When and how are they called?
6. **Error Handling**: How does it handle errors? Are there retry mechanisms?
7. **Cleanup**: What happens on component unmount? Are there cleanup functions?
8. **Edge Cases**: What are potential race conditions, timing issues, or boundary conditions?
9. **Dependencies**: What values trigger re-execution? What's memoized?

**⚠️ STOP HERE**: Share your analysis and wait for confirmation before writing tests.

---

## Hook Testing Principles

### Test Behavior, Not Implementation

**Red Flags - Signs You're Testing Implementation:**

- ❌ Spying on setTimeout or setImmediate to verify timing
- ❌ Checking internal variable values not exposed in API
- ❌ Testing that Preact hooks (useEffect, useCallback) are called
- ❌ Verifying order of internal function calls
- ❌ Mocking internal functions to verify they're called
- ❌ Testing error handling mechanisms rather than error outcomes
- ❌ Need complex mocking to make test work
- ❌ Test breaks when you refactor but behavior doesn't change

**✅ Focus On:**

- Observable outcomes from the hook's API
- State changes visible through returned values
- Side effects that produce observable results
- Error states and recovery behavior

---

## Hook Test Structure

### Setup Pattern

```typescript
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123); // Dec 25, 2023, 4:10:45.123 PM UTC
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // Tests go here
});
```

---

## Hook Test Checklist

### ✓ Initial State

- [ ] Returns correct initial values
- [ ] Handles initial parameters correctly
- [ ] Default values work as expected

**Example:**

```typescript
test('should return correct initial state', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current).toEqual({
        data: null,
        loading: false,
        error: null,
    });
});

test('should handle initial parameters', () => {
    const { result } = renderHook(() => useMyHook({ initialValue: 'test' }));

    expect(result.current.value).toBe('test');
});
```

### ✓ State Updates

- [ ] Updates state when functions are called
- [ ] Handles multiple sequential updates
- [ ] State persists across re-renders

**Example:**

```typescript
test('should update state when function is called', () => {
    const { result } = renderHook(() => useCounter());

    result.current.increment();
    expect(result.current.count).toBe(1);

    result.current.increment();
    expect(result.current.count).toBe(2);
});
```

### ✓ Side Effects

- [ ] Side effects (e.g., data fetching, subscriptions) are triggered correctly
- [ ] State and returned values update correctly when dependencies change
- [ ] Cleanup logic correctly tears down side effects (e.g., subscriptions, timers) on unmount

**Example:**

```typescript
test('should trigger side effects on mount', async () => {
    const onFetch = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useFetch(onFetch));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ data: 'test' });
    expect(onFetch).toHaveBeenCalledTimes(1);
});

test('should cleanup on unmount', () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() => useSubscription(cleanup));

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
});
```

### ✓ Error Handling

- [ ] Handles errors gracefully
- [ ] Sets error state correctly
- [ ] Recovers from errors

**Example:**

```typescript
test('should handle errors gracefully', async () => {
    const onFetch = vi.fn().mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useFetch(onFetch));

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(new Error('API Error'));
    expect(result.current.data).toBe(null);
});
```

### ✓ Edge Cases

- [ ] Handles null/undefined inputs
- [ ] Handles rapid successive calls
- [ ] Handles unmounting during async operations

**Example:**

```typescript
test('should handle nullish inputs gracefully', () => {
    const { result: nullResult } = renderHook(() => useMyHook(null as any));
    const { result: undefinedResult } = renderHook(() => useMyHook(undefined));
    const { result: noParamResult } = renderHook(() => useMyHook());

    // All should fall back to default behavior
    expect(nullResult.current.value).toBe('default');
    expect(undefinedResult.current.value).toBe('default');
    expect(noParamResult.current.value).toBe('default');
});

test('should handle rapid successive calls', () => {
    const { result } = renderHook(() => useCounter());

    result.current.increment();
    result.current.increment();
    result.current.increment();

    expect(result.current.count).toBe(3);
});

test('should handle unmounting during async operation', async () => {
    const onFetch = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('data'), 1000)));
    const { result, unmount } = renderHook(() => useFetch(onFetch));

    expect(result.current.loading).toBe(true);

    unmount(); // Unmount before promise resolves

    // Should not cause errors or warnings
});
```

---

## Hook Testing Patterns

### Function Reference Stability

Test that functions maintain stable references when dependencies don't change, and create new references when they do.

```typescript
test('should return stable function references when dependencies do not change', () => {
    const { result, rerender } = renderHook(() => useTimezoneAwareDateFormatting('America/New_York'));
    const initialResult = result.current;
    const { dateFormat, fullDateFormat } = result.current;

    rerender();

    expect(result.current).toStrictEqual(initialResult);
    expect(result.current.dateFormat).toBe(dateFormat); // Same reference
    expect(result.current.fullDateFormat).toBe(fullDateFormat);
});

test('should return new function references when dependencies change', () => {
    const { result, rerender } = renderHook(useTimezoneAwareDateFormatting, {
        initialProps: 'America/New_York',
    });
    const initialResult = result.current;
    const { dateFormat, fullDateFormat } = result.current;

    rerender('Europe/London');

    expect(result.current).not.toStrictEqual(initialResult);
    expect(result.current.dateFormat).not.toBe(dateFormat); // New reference
    expect(result.current.fullDateFormat).not.toBe(fullDateFormat);
});
```

### Data-Driven Testing for Hooks

Use data-driven patterns to test multiple scenarios efficiently.

```typescript
test('should format dates correctly across DST and non-DST timezones', () => {
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

    const WINTER_TIMESTAMP = 1703520645123;
    const SUMMER_TIMESTAMP = 1688832645123;

    TIMEZONE_DATA.forEach(({ timezone, winter, summer }) => {
        const { result } = renderHook(() => useTimezoneAwareDateFormatting(timezone));
        const { dateFormat, fullDateFormat } = result.current;

        expect(dateFormat(WINTER_TIMESTAMP)).toBe(winter.date);
        expect(fullDateFormat(WINTER_TIMESTAMP)).toBe(winter.fullDate);
        expect(dateFormat(SUMMER_TIMESTAMP)).toBe(summer.date);
        expect(fullDateFormat(SUMMER_TIMESTAMP)).toBe(summer.fullDate);
    });
});
```

### Async Timer Testing

```typescript
test('should handle time advancement', async () => {
    const { result } = renderHook(() => useTimer());
    const initialTimestamp = result.current.timestamp;

    await vi.advanceTimersByTimeAsync(5000);

    expect(result.current.timestamp).not.toBe(initialTimestamp);
    expect(result.current.timestamp).toBe(initialTimestamp + 5000);
});
```

### Testing with Dependencies

```typescript
test('should update when dependency changes', () => {
    const { result, rerender } = renderHook(({ userId }) => useUserData(userId), { initialProps: { userId: 1 } });

    expect(result.current.userId).toBe(1);

    rerender({ userId: 2 });

    expect(result.current.userId).toBe(2);
});
```

---

## Hook-Specific Patterns

### Object-Level Assertions

Prefer testing the entire returned object rather than individual properties.

**✅ Good:**

```typescript
test('should return complete state object', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current).toEqual({
        timezone: 'UTC',
        clockTime: '04:10 PM',
        GMTOffset: '',
        timestamp: SYSTEM_TIMESTAMP,
    });
});
```

**❌ Avoid:**

```typescript
test('should return correct values', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.timezone).toBe('UTC');
    expect(result.current.clockTime).toBe('04:10 PM');
    expect(result.current.GMTOffset).toBe('');
    expect(result.current.timestamp).toBe(SYSTEM_TIMESTAMP);
});
```

### Error State Testing

```typescript
test('should handle invalid inputs gracefully', () => {
    const { result } = renderHook(() => useTimezoneAwareDateFormatting());
    const { dateFormat, fullDateFormat } = result.current;

    [new Date('unknown'), new Date('unknown').getTime()].forEach(invalidDate => {
        expect(dateFormat(invalidDate)).toBe('Invalid Date');
        expect(fullDateFormat(invalidDate)).toBe('Invalid Date');
    });
});
```

---

## What NOT to Test

### Implementation Details

**❌ Don't Test:**

```typescript
// Don't test internal state management
test('should call useEffect with correct dependencies', () => {
    const useEffectSpy = vi.spyOn(preact, 'useEffect');
    renderHook(() => useMyHook());
    expect(useEffectSpy).toHaveBeenCalledWith(expect.any(Function), [dependency]);
});

// Don't test internal memoization
test('should use useMemo for expensive calculation', () => {
    const useMemoSpy = vi.spyOn(preact, 'useMemo');
    renderHook(() => useMyHook());
    expect(useMemoSpy).toHaveBeenCalled();
});

// Don't spy on timing internals
test('should use setTimeout', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    renderHook(() => useMyHook());
    expect(setTimeoutSpy).toHaveBeenCalled();
});
```

**✅ Do Test:**

```typescript
// Test observable behavior
test('should update value after delay', async () => {
    const { result } = renderHook(() => useDelayedValue('test', 1000));

    expect(result.current.value).toBe(null);

    await vi.advanceTimersByTimeAsync(1000);

    expect(result.current.value).toBe('test');
});
```

---

## Quality Checklist for Hook Tests

Before completing hook tests, verify:

- [ ] Analysis phase completed and confirmed
- [ ] All assertions use concrete, predictable values
- [ ] Testing behavior, not implementation details
- [ ] Initial state tested with various parameters
- [ ] State updates tested for all exposed functions
- [ ] Side effects tested with observable outcomes
- [ ] Cleanup logic tested on unmount
- [ ] Error handling tested with concrete error states
- [ ] Edge cases covered (null, undefined, rapid calls, unmounting during async)
- [ ] Function reference stability tested where applicable
- [ ] Data-driven patterns used for multiple similar scenarios
- [ ] Async operations properly awaited
- [ ] Timers controlled with `vi.useFakeTimers()` and `vi.setSystemTime()`
- [ ] Mocks cleared between tests
- [ ] Coverage meets minimum 85% requirement

---

## Common Hook Testing Mistakes

### 1. Testing Implementation Instead of Behavior

**❌ Wrong:**

```typescript
test('should debounce with setTimeout', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    renderHook(() => useDebounce('value', 500));
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);
});
```

**✅ Right:**

```typescript
test('should delay value update by specified time', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), { initialProps: { value: 'initial', delay: 500 } });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still old value

    await vi.advanceTimersByTimeAsync(500);
    expect(result.current).toBe('updated'); // Now updated
});
```

### 2. Not Testing Cleanup

**❌ Wrong:**

```typescript
test('should create subscription', () => {
    const { result } = renderHook(() => useSubscription());
    expect(result.current.isSubscribed).toBe(true);
});
```

**✅ Right:**

```typescript
test('should cleanup subscription on unmount', () => {
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);

    const { unmount } = renderHook(() => useSubscription(subscribe));

    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
});
```

### 3. Over-Complicating Simple Tests

**❌ Wrong:**

```typescript
test('should handle null', () => {
    /* ... */
});
test('should handle undefined', () => {
    /* ... */
});
test('should handle missing parameter', () => {
    /* ... */
});
```

**✅ Right:**

```typescript
test('should handle nullish inputs gracefully', () => {
    const { result: nullResult } = renderHook(() => useMyHook(null as any));
    const { result: undefinedResult } = renderHook(() => useMyHook(undefined));
    const { result: noParamResult } = renderHook(() => useMyHook());

    const expectedDefault = 'default-value';
    expect(nullResult.current.value).toBe(expectedDefault);
    expect(undefinedResult.current.value).toBe(expectedDefault);
    expect(noParamResult.current.value).toBe(expectedDefault);
});
```

---

## Success Criteria for Hook Tests

**Hook Tests Must:**

- ✅ Complete analysis phase before writing tests
- ✅ Test observable behavior, not internal implementation
- ✅ Cover all return values and functions from the hook's API
- ✅ Test side effects through their observable outcomes
- ✅ Verify cleanup logic runs on unmount
- ✅ Handle error states with concrete expectations
- ✅ Test edge cases (null, undefined, rapid calls, async unmounting)
- ✅ Use data-driven patterns to avoid repetitive tests
- ✅ Maintain deterministic assertions with concrete values
- ✅ Achieve minimum 85% coverage with meaningful tests
