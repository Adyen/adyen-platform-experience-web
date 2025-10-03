# Testing Guidelines - General

## Repository Context

**Framework:** Preact (NOT React) - All imports must use `preact` and `preact/hooks`  
**Testing Stack:** Vitest + @testing-library/preact + TypeScript  
**File Convention:** Co-locate tests with source files using `.test.ts` or `.test.tsx`  
**Vitest Environment:** Use `@vitest-environment jsdom` for hooks and components

---

## Core Testing Principles

### 1. Test Behavior, Not Implementation

**What to Test:**

- What users see and interact with
- Observable outcomes and user-facing functionality
- Behavior that would break if the feature is broken
- Public API (props, callbacks, rendered output)

**Don't Test:**

- Internal state variables or private methods
- Exact DOM structure or CSS classes (unless functional)
- Third-party library internals
- Implementation details that could change during refactoring
- Internal mechanisms (e.g., that `useEffect` or `useCallback` are called)

### 2. Deterministic Assertions Only

**Critical Rule:** All test assertions must use concrete, deterministic values. No generic type checks or regex patterns allowed.

**❌ Never Use:**

```typescript
expect(typeof result).toBe('string');
expect(result.length).toBeGreaterThan(0);
expect(result).toMatch(/pattern/);
expect(result).toContain('partial text');
```

**✅ Always Use:**

```typescript
expect(result).toBe('04:10 PM');
expect(result).toEqual(['04:10 PM', '']);
expect(getTime('UTC')).toEqual(['04:10 PM', '']);
```

### 3. Real Implementation Over Mocking

- Use real implementations with controlled inputs
- Control behavior through `vi.useFakeTimers()` and `vi.setSystemTime()`
- Only mock external dependencies, not internal utilities
- Re-use mocks from `./mocks` folder whenever possible
- Use `vi.mocked()` for typed mocks instead of casting to `any`

---

## Query Priority (Testing Library)

Use Testing Library queries in this order:

1. `getByRole` - Best for accessibility
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - When no label
4. `getByText` - Static content
5. `getByTestId` - Last resort only

**❌ Avoid:** Direct DOM access via `container` or `document.querySelector`  
**✅ Use:** Idiomatic Testing Library queries

---

## File Structure & Organization

### Import Organization

```typescript
// System imports (alphabetical)
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';

// Local imports
import useHook, { helperFunction } from './useHook';
import Localization from '../core/Localization/Localization';

vi.mock('../core/Context/useCoreContext');
```

### Test Structure

```typescript
describe('ModuleName', () => {
    // Mock setup
    const mockUseCoreContext = vi.mocked(useCoreContext);

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123); // Dec 25, 2023, 4:10:45.123 PM UTC
        vi.clearAllMocks(); // Reset mocks between tests
        mockUseCoreContext.mockReturnValue({ i18n: new Localization().i18n } as any);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    // Test-specific constants close to their usage
    test('should handle timezone formatting', () => {
        const WINTER_TIMESTAMP = 1703520645123;
        const SUMMER_TIMESTAMP = 1688832645123;
        // ... test logic
    });
});
```

**Key Principles:**

- Keep test structure flat - avoid nested `describe` blocks unless absolutely necessary
- Group related tests by logical category: rendering, interactions, edge cases
- Move common setup to `beforeEach`, test-specific constants in test functions
- Use meaningful test names: `'should return correct time and offset for valid IANA timezones'`

---

## Data-Driven Testing

Extract reusable test data as constants and use parameterized testing patterns. Prefer `forEach` loops over `test.each()` for better readability and debugging.

**✅ Good - Data-Driven Approach:**

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
        const { dateFormat, fullDateFormat } = result.current;

        expect(dateFormat(WINTER_TIMESTAMP)).toBe(winter.date);
        expect(fullDateFormat(WINTER_TIMESTAMP)).toBe(winter.fullDate);
        expect(dateFormat(SUMMER_TIMESTAMP)).toBe(summer.date);
        expect(fullDateFormat(SUMMER_TIMESTAMP)).toBe(summer.fullDate);
    });
});
```

**❌ Avoid - Test Repetition:**

```typescript
// Don't create multiple tests for the same behavior
test('should work with no timezone parameter', () => {
    /* ... */
});
test('should handle null timezone', () => {
    /* ... */
});
test('should handle undefined timezone', () => {
    /* ... */
});
```

---

## Assertion Patterns

### Object-Level Assertions

**✅ Prefer:**

```typescript
expect(result.current).toEqual({
    timezone: 'UTC',
    clockTime: '04:10 PM',
    GMTOffset: '',
    timestamp: SYSTEM_TIMESTAMP,
});
```

**❌ Avoid:**

```typescript
expect(result.current.timezone).toBe('UTC');
expect(result.current.clockTime).toBe('04:10 PM');
expect(result.current.GMTOffset).toBe('');
```

### System-Dependent Testing

**✅ Calculate Expected Values:**

```typescript
test('should handle nullish timezones gracefully', () => {
    const currentTime = Date.now();
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZoneName: 'short' } as const;
    const systemTimezoneFormat = new Intl.DateTimeFormat('en-US', {
        ...formatOptions,
        timeZone: systemTimezone,
    }).format(currentTime);

    const { result } = renderHook(() => useTimezoneAwareDateFormatting());
    expect(result.current.dateFormat(currentTime, formatOptions)).toBe(systemTimezoneFormat);
});
```

**❌ Never Use Generic Assertions:**

```typescript
expect(formattedDate).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, GMT[+-]?\d*$/);
expect(formattedDate).toContain('Dec 25, 2023');
expect(typeof result).toBe('string');
```

---

## Code Style & Formatting

### Consistent Formatting

**✅ Good:**

```typescript
const DATE_FORMATS = [
    {
        options: { year: 'numeric', month: 'short', day: 'numeric', timeZoneName: 'short' } as const,
        expectations: {
            'America/New_York': 'Dec 25, 2023, EST',
            'Europe/London': 'Dec 25, 2023, GMT',
            'Asia/Tokyo': 'Dec 26, 2023, GMT+9',
        },
    },
];

// Simple arrays stay inline
[Date.now(), new Date(), new Date().toISOString()].forEach(date => {
    expect(dateFormat(date)).toBe('12/26/2023');
});
```

### ESLint Rules to Follow

- **`react/jsx-no-literals`**: Store string literals in centralized constants with `as const` for better TypeScript inference
- **`arrow-parens`**: Always wrap arrow function parameters in parentheses

---

## Common Anti-Patterns to Avoid

### 1. Over-Mocking

- Don't mock core utilities unnecessarily
- Don't mock what can be controlled through inputs
- Don't create fake implementations when real ones work
- Prefer real `Intl.DateTimeFormat` over mocked implementations

### 2. Testing Implementation Details

- Don't test internal state variables
- Don't verify that internal functions were called
- Don't spy on timing mechanisms (setTimeout, setImmediate)

### 3. Test Repetition

- Don't create multiple tests for the same behavior with different inputs
- Consolidate into parameterized tests using data arrays
- Merge tests that validate the same underlying behavior
- Before adding a test, ask: "Does this exercise a unique code path?"
- Testing undefined and null separately is often redundant

### 4. Type Safety Issues

- Don't cast to `any` - use `vi.mocked()` for typed mocks
- This provides autocomplete, type checking, and better refactoring support

### 5. Common Pitfalls

- Don't forget to `await` async operations
- Don't forget to clear mocks between tests (add `vi.clearAllMocks()` to `beforeEach`)
- Don't test internal state instead of rendered output

---

## Coverage Guidelines

### Minimum Requirements

- **85% statement/line coverage minimum**
- Test all exported functions
- Include edge cases and error conditions
- DST scenarios for date/time code

### Coverage Best Practices

- Focus on behavior coverage, not just line coverage percentages
- Accept build artifact gaps (HMR, source maps, etc.)
- Group related assertions in one test rather than splitting
- If coverage is less than 80%, iterate and explain gaps

### Coverage Analysis Process

After tests are complete, provide:

```
Coverage Analysis:
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

[If not 100%]
Missing Coverage:
1. Line X: [what's not tested]
   - Testable: YES/NO
   - Reason if not testable: [explanation]
2. Branch at line Y: [which condition not tested]
   - Testable: YES/NO
   - Reason if not testable: [explanation]

[If 100% is achievable]
Would you like to achieve 100% coverage?
To reach 100%, we need:
- [Specific test needed]
- [Specific test needed]

[If 100% is NOT achievable]
Maximum achievable coverage: X%
Reason 100% is not possible:
- [Explanation of fundamental limitation]
- [Alternative approaches considered]

Recommended: Accept X% coverage because [reasoning]
```

---

## Workflow

### When Writing Tests for Hooks:

1. Always follow `.agents/testing-hooks-guide.md`
2. Complete the analysis phase before writing any tests
3. Wait for user confirmation after analysis
4. Check best practices from Vitest docs

### When Writing Tests for Components:

1. Always follow `.agents/testing-components-guide.md`
2. Check best practices from Vitest docs
3. Check best practices from testing-library docs

### After Tests are Complete:

1. Analyze code coverage (statements, branches, functions, lines)
2. Report any gaps in coverage with specific line numbers and explanations
3. For each gap, explain if it CAN be tested or if it's fundamentally untestable
4. If 100% is achievable, ask if user wants to achieve it and list needed tests
5. If 100% is NOT achievable, explain why and what maximum coverage is realistic
6. Only add coverage tests after user confirmation

---

## Quality Checklist

Before completing any test file, verify:

- [ ] All assertions use concrete, predictable values (no `typeof`, `toMatch`, `toContain`)
- [ ] No generic assertions or regex patterns for deterministic behavior
- [ ] Reusable test data extracted to constants and moved close to usage
- [ ] Common setup moved to `beforeEach`, test-specific constants in test functions
- [ ] Tests are independent and can run in any order
- [ ] Edge cases and error conditions covered with concrete expectations
- [ ] Async operations use proper async/await patterns
- [ ] Coverage meets 85% minimum requirement
- [ ] Test structure is flat (avoid nested `describe` blocks)
- [ ] Related test scenarios merged into single data-driven tests
- [ ] Variable names are descriptive and purpose-driven
- [ ] Code style is consistent (trailing commas, formatting, spacing)
- [ ] System-dependent behavior tested with calculated expected values
- [ ] Mocks are cleared between tests
- [ ] Using `vi.mocked()` instead of `any` casts
- [ ] Following ESLint rules (`react/jsx-no-literals`, `arrow-parens`)

---

## Success Criteria

**Tests Must:**

- Be deterministic and repeatable (no flaky tests)
- Serve as living documentation of expected behavior
- Clearly indicate problems when they fail with concrete value mismatches
- Use real implementations wherever possible
- Follow data-driven patterns to reduce duplication
- Maintain clean, consistent code style and organization
- Test system-dependent behavior with calculated expectations
- Consolidate related scenarios to avoid test repetition
- Have meaningful and readable names
- Focus on behavior coverage over line coverage percentages
- Run efficiently with minimal redundancy
