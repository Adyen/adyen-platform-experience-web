## Testing Standards

- Organization: Group related tests in describe blocks (rendering, interactions, edge cases)
- We enforce the `react/jsx-no-literals` ESLint rule to improve maintainability. Instead of using string literals directly in JSX, store them in centralized constants. This makes updates easier and, when used with `as const`, provides better TypeScript inference.
- We enforce the `arrow-parens` ESLint rule with the `"always"` option. Please ensure all arrow function parameters are wrapped in parentheses for consistency.
- Balance Between DRY and Readability

## What to Test (Priority Order)

### High Priority

- Component renders expected content based on props
- User interactions (clicks, typing, form submission) trigger correct behavior
- Conditional rendering (loading states, error states, empty states)
- Accessibility (ARIA attributes, keyboard navigation)
- Callback props fire with correct arguments

#### Do test:

- What users see and interact with
- Behavior that would break if the feature is broken
- Public API (props, callbacks, rendered output)

#### Don't Test

- Internal state variables or private methods
- Exact DOM structure or CSS classes (unless functional)
- Third-party library internals
- Implementation details that could change during refactoring

## Mocking

Keep mocks simple and behavior-focused
Re-use mocks from ./mocks folder whenever possible

## Code Quality Guidelines

### Test Naming

Write descriptive names that explain the behavior being tested.

### Keep Tests Focused

One primary assertion per test when possible
Extract repetitive setup into helper functions

### Common Anti-Patterns to Avoid

Be cautious with hoisting in mock factories.
Avoid direct Node access. Prefer using the methods from Testing Library.
Avoid using container methods. Prefer using the methods from Testing Library.

### Coverage Approach

Focus on behavior coverage, not line coverage percentages:

- Happy path for primary use case
- Key edge cases (empty, null, extreme values)
- Error states and error handling
- Critical accessibility features

### Idiomatic Test Assertions

- Prefer expect.any(Type) over typeof checks
