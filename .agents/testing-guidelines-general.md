# General Testing Guidelines

## Repository Context

**Framework:** Preact (NOT React) - All imports must use `preact` and `preact/hooks`  
**Testing Stack:** Vitest + @testing-library/preact + TypeScript  
**File Convention:** Co-locate tests with source files using `.test.ts` or `.test.tsx`

---

## Query Priority

Use Testing Library queries in this order:

1. `getByRole` - Best for accessibility
2. `getByLabelText` - Form elements
3. `getByPlaceholderText` - When no label
4. `getByText` - Static content
5. `getByTestId` - Last resort only

---

## Common Pitfalls

- ❌ Testing internal state instead of rendered output
- ❌ Forgetting to `await` async operations
- ❌ Not clearing mocks between tests. Ensure mocks are reset in each test, for example by adding `vi.clearAllMocks()` to a `beforeEach` block in `config/setupTests.ts`.

---

# Project Testing Standards

## Type safety

Casting to `any` defeats the purpose of TypeScript and loses valuable IDE support. Use `vi.mocked()` for typed mocks that provide:

- Autocomplete for mock methods
- Compile-time type checking
- Better refactoring support
- Clearer developer intent

## Token Efficiency

- Concise tests: Clear purpose, minimal setup
- Helper functions: Extract common setup patterns
- Avoid redundancy: Don't test the same behavior multiple ways
- Progressive detail: Start with core behavior, add edge cases only if they add value

## When writing tests for hooks:

1. Always follow .agents/testing-hooks-guide.md
2. Complete the analysis phase before writing any tests
3. Wait for user confirmation after analysis
4. Check best practices from Vitest docs.

## When writing tests for components:

1. Always follow .agents/testing-components-guide.md
2. Check best practices from Vitest docs.
3. Check best practices from testing-library docs.

## After tests are complete:

1. Analyze code coverage (statements, branches, functions, lines)
2. Report any gaps in coverage with specific line numbers and explanations
3. For each gap, explain if it CAN be tested or if it's fundamentally untestable
4. If 100% is achievable, ask if user wants to achieve it and list needed tests
5. If 100% is NOT achievable, explain why and what maximum coverage is realistic
6. Only add coverage tests after user confirmation

## Coverage Analysis Format:

When tests are complete, provide:

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
