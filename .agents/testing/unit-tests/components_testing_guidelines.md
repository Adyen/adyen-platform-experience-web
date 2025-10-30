# Testing Guidelines - Components

## What to Test

**Do test:**

- What users see and interact with
- Behavior that would break if the feature is broken
- Public API (props, callbacks, rendered output)

**Don't test:**

- Internal state variables or private methods
- Exact DOM structure or CSS classes (unless functional)
- Third-party library internals
- Implementation details that could change during refactoring

## Organization

Group related tests in describe blocks: rendering, interactions, edge cases.

```typescript
describe('MyComponent', () => {
    describe('Rendering', () => {
        test('should render with default props', () => {
            /* ... */
        });
    });

    describe('Interactions', () => {
        test('should call onClick when button is clicked', () => {
            /* ... */
        });
    });

    describe('Edge Cases', () => {
        test('should handle null props gracefully', () => {
            /* ... */
        });
    });
});
```

## Priority Order

### High Priority

1. Component renders expected content based on props
2. User interactions (clicks, typing, form submission) trigger correct behavior
3. Conditional rendering (loading states, error states, empty states)
4. Accessibility (ARIA attributes, keyboard navigation)
5. Callback props fire with correct arguments

## ESLint Rules

- **react/jsx-no-literals**: Store string literals in centralized constants with `as const`
- **arrow-parens**: Always wrap arrow function parameters in parentheses

## Mocking

- Keep mocks simple and behavior-focused
- Re-use mocks from ./mocks folder whenever possible
- Avoid hoisting in mock factories

## Common Anti-Patterns

- Direct DOM access via container or document.querySelector (use Testing Library queries)
- Testing internal state instead of rendered output
- Over-specific assertions (exact DOM structure, innerHTML)
- Not using semantic queries (prefer getByRole over getByTestId)

## Test Naming

Write descriptive names that explain behavior:

- Good: "should disable submit button when form is invalid"
- Bad: "button test"

## Keep Tests Focused

- One primary assertion per test when possible
- Extract repetitive setup into helper functions

## Coverage Approach

Focus on behavior coverage, not line coverage percentages:

- Happy path for primary use case
- Key edge cases (empty, null, extreme values)
- Error states and error handling
- Critical accessibility features

## Balance DRY and Readability

Don't over-abstract tests. Sometimes repetition is clearer than excessive abstraction.

## Quality Checklist

- Using semantic queries over test IDs
- No direct DOM manipulation
- Testing user-visible behavior
- Accessibility features tested
- All user interactions tested
- Conditional rendering tested
- Callback props tested
- Edge cases covered
- String literals in constants
- Arrow functions use parentheses
- Mocks are reused
- Async operations awaited
- Test names are descriptive
