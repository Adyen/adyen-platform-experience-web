# Testing Guidelines - General

## Repository Context

**Framework:** Preact (NOT React) - All imports must use `preact` and `preact/hooks`  
**Testing Stack:** Vitest + @testing-library/preact + TypeScript  
**File Convention:** Co-locate tests with source files using `.test.ts` or `.test.tsx`

## Core Principles

### Critical Rule: Deterministic Assertions Only

All test assertions must use concrete, deterministic values. No generic type checks or regex patterns allowed.

Never use:

```typescript
expect(typeof result).toBe('string');
expect(result.length).toBeGreaterThan(0);
expect(result).toMatch(/pattern/);
```

Always use:

```typescript
expect(result).toBe('04:10 PM');
expect(result).toEqual(['04:10 PM', '']);
```

### Real Implementation Over Mocking

- Use real implementations with controlled inputs
- Control behavior through `vi.useFakeTimers()` and `vi.setSystemTime()`
- Only mock external dependencies, not internal utilities
- Use `vi.mocked()` for typed mocks instead of casting to `any`

### Code Style

- Use consistent formatting with trailing commas
- Simple arrays stay inline, complex ones get expanded
- Keep variable names descriptive and purpose-driven

## Query Priority (Testing Library)

1. `getByRole` - Best for accessibility
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - When no label
4. `getByText` - Static content
5. `getByTestId` - Last resort only

Avoid direct DOM access via `container` or `document.querySelector`

## Common Pitfalls

- Testing internal state instead of rendered output
- Forgetting to `await` async operations
- Not clearing mocks between tests (add `vi.clearAllMocks()` to `beforeEach`)

## Type Safety

Use `vi.mocked()` instead of casting to `any` for:

- Autocomplete for mock methods
- Compile-time type checking
- Better refactoring support

## Workflow

### When writing tests for hooks

1. Always follow `.agents/testing/unit-tests/hooks_testing_guidelines.md`
2. Complete the analysis phase before writing any tests
3. Wait for user confirmation after analysis

### When writing tests for components

1. Always follow `.agents/testing/unit-tests/components_testing_guidelines.md`

### After tests are complete

1. Analyze code coverage (statements, branches, functions, lines)
2. Report any gaps with specific line numbers
3. For each gap, explain if it CAN be tested or if it's fundamentally untestable
4. If 100% is achievable, ask if user wants to achieve it and list needed tests
5. If 100% is NOT achievable, explain why and what maximum coverage is realistic
6. Only add coverage tests after user confirmation

## Coverage Analysis Format

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

[If 100% is achievable]
Would you like to achieve 100% coverage?
To reach 100%, we need:
- [Specific test needed]

[If 100% is NOT achievable]
Maximum achievable coverage: X%
Reason 100% is not possible: [explanation]
Recommended: Accept X% coverage because [reasoning]
```

## Coverage Requirements

- Focus on behavior coverage, not just line coverage
- Accept build artifact gaps (HMR, source maps)
- If coverage is less than 80% for the file being tested, iterate

## Quality Checklist

- Analysis phase completed and confirmed
- All assertions use concrete values (no typeof, toMatch, toContain)
- Testing behavior, not implementation
- Common setup in beforeEach, test-specific constants in test functions
- Edge cases covered with concrete expectations
- Async operations properly awaited
- Mocks cleared between tests
- Try to cover more with fewer and more precise tests. Avoid having too many tests if it is not increasing the coverage.
- Follow the best practices from Vitest and @testing-library/preact
