# Testing Guidelines - Components

## Component Testing Principles

### Test User-Facing Behavior

Focus on what users see and interact with, not internal implementation details.

**Do Test:**

- Component renders expected content based on props
- User interactions (clicks, typing, form submission) trigger correct behavior
- Conditional rendering (loading states, error states, empty states)
- Accessibility (ARIA attributes, keyboard navigation)
- Callback props fire with correct arguments

**Do Not Test:**

- Internal state variables or private methods
- Exact DOM structure or CSS classes (unless functional)
- Third-party library internals
- Implementation details that could change during refactoring

## Component Test Structure

### Organization

Group related tests in describe blocks by logical category:

```typescript
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  describe('Rendering', () => {
    test('should render with default props', () => {
      render(<MyComponent />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    test('should call onClick when button is clicked', () => {
      const handleClick = vi.fn();
      render(<MyComponent onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null props gracefully', () => {
      render(<MyComponent title={null} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

## Query Selection Guide

Always use Testing Library queries in priority order:

### 1. getByRole (Preferred)

Best for accessibility and semantic HTML.

```typescript
test('should render a button', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button', { name: /submit/i });
  expect(button).toBeInTheDocument();
});
```

### 2. getByLabelText

Best for form elements with labels.

```typescript
test('should render labeled input', () => {
  render(<LoginForm />);
  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toBeInTheDocument();
});
```

### 3. getByPlaceholderText

Use when there is no label (though labels are preferred for accessibility).

```typescript
test('should render input with placeholder', () => {
  render(<SearchBox />);
  const searchInput = screen.getByPlaceholderText(/search/i);
  expect(searchInput).toBeInTheDocument();
});
```

### 4. getByText

Good for static content and non-interactive elements.

```typescript
test('should render heading text', () => {
  render(<Header title="Welcome" />);
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

### 5. getByTestId (Last Resort)

Only use when other queries are not suitable.

```typescript
test('should render complex component', () => {
  render(<ComplexWidget />);
  const widget = screen.getByTestId('complex-widget');
  expect(widget).toBeInTheDocument();
});
```

## What to Test (Priority Order)

### High Priority

#### 1. Rendering Based on Props

```typescript
test('should render different states based on status prop', () => {
  const { rerender } = render(<StatusBadge status="success" />);
  expect(screen.getByText('Success')).toBeInTheDocument();

  rerender(<StatusBadge status="error" />);
  expect(screen.getByText('Error')).toBeInTheDocument();
});
```

#### 2. User Interactions

```typescript
test('should increment counter when button is clicked', () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

#### 3. Conditional Rendering

```typescript
test('should show loading state', () => {
  render(<DataTable loading={true} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
```

#### 4. Accessibility

```typescript
test('should have accessible button', () => {
  render(<IconButton icon="close" label="Close dialog" />);
  const button = screen.getByRole('button', { name: /close dialog/i });
  expect(button).toHaveAttribute('aria-label', 'Close dialog');
});
```

#### 5. Callback Props

```typescript
test('should call onSubmit with form data', () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  fireEvent.input(screen.getByLabelText(/username/i), {
    target: { value: 'testuser' }
  });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    username: 'testuser',
    password: 'password123',
  });
});
```

## Testing Patterns

### Avoid Direct DOM Access

Wrong approach:

```typescript
test('should render button', () => {
  const { container } = render(<MyComponent />);
  const button = container.querySelector('button');
  expect(button).toBeTruthy();
});
```

Correct approach:

```typescript
test('should render button', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});
```

### Use String Constants for Literals

Follow the react/jsx-no-literals ESLint rule.

Wrong approach:

```typescript
test('should render text', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

Correct approach:

```typescript
const TEXT_CONTENT = {
  GREETING: 'Hello World',
} as const;

test('should render text', () => {
  render(<div>{TEXT_CONTENT.GREETING}</div>);
  expect(screen.getByText(TEXT_CONTENT.GREETING)).toBeInTheDocument();
});
```

### Always Use Arrow Function Parentheses

Follow the arrow-parens ESLint rule.

Wrong approach:

```typescript
const handleClick = e => console.log(e);
```

Correct approach:

```typescript
const handleClick = e => console.log(e);
```

## Mocking

### Keep Mocks Simple

Re-use mocks from mocks folder whenever possible.

```typescript
export const mockApiResponse = {
    data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
    ],
};
```

```typescript
import { mockApiResponse } from './mocks/handlers';

test('should render items from API', async () => {
  const fetchData = vi.fn().mockResolvedValue(mockApiResponse);
  render(<ItemList fetchData={fetchData} />);

  await waitFor(() => {
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
```

### Avoid Hoisting Issues in Mock Factories

Avoid this pattern:

```typescript
const mockValue = 'test';
vi.mock('./module', () => ({
    useHook: () => mockValue,
}));
```

Better approach:

```typescript
vi.mock('./module', () => ({
    useHook: vi.fn(),
}));

import { useHook } from './module';
const mockUseHook = vi.mocked(useHook);
mockUseHook.mockReturnValue('test');
```

## Testing Async Behavior

### Use waitFor for Async Updates

```typescript
test('should load and display data', async () => {
  render(<DataDisplay />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Test Loading States

```typescript
test('should show loading spinner while fetching', () => {
  render(<AsyncComponent loading={true} />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});
```

## Data-Driven Component Tests

Use data-driven patterns for testing multiple similar scenarios.

```typescript
const USER_SCENARIOS = [
  { role: 'admin', canEdit: true, canDelete: true },
  { role: 'editor', canEdit: true, canDelete: false },
  { role: 'viewer', canEdit: false, canDelete: false },
];

test('should render actions based on user role', () => {
  USER_SCENARIOS.forEach(({ role, canEdit, canDelete }) => {
    const { unmount } = render(<UserActions role={role} />);

    if (canEdit) {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    }

    unmount();
  });
});
```

## Coverage Approach

### Focus on Behavior Coverage

Focus on behavior coverage, not line coverage percentages.

Key areas to cover:

- Happy path for primary use case
- Key edge cases (empty, null, extreme values)
- Error states and error handling
- Critical accessibility features

Example:

```typescript
describe('TodoList', () => {
    test('should render list of todos', () => {
        // Happy path
    });

    test('should show empty state when no todos', () => {
        // Edge case
    });

    test('should display error message on load failure', () => {
        // Error state
    });
});
```

## Common Anti-Patterns

### 1. Testing Internal State

Wrong approach:

```typescript
test('should set loading state to true', () => {
  const { rerender } = render(<MyComponent />);
  expect(component.state.loading).toBe(true);
});
```

Correct approach:

```typescript
test('should show loading indicator', () => {
  render(<MyComponent loading={true} />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

### 2. Testing CSS Classes

Wrong approach:

```typescript
test('should apply error class', () => {
  render(<Input error={true} />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveClass('input-error');
});
```

Correct approach:

```typescript
test('should indicate error state accessibly', () => {
  render(<Input error={true} errorMessage="Invalid input" />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Invalid input')).toBeInTheDocument();
});
```

### 3. Over-Specific Assertions

Wrong approach:

```typescript
test('should render exact DOM structure', () => {
  const { container } = render(<Card title="Test" />);
  expect(container.innerHTML).toBe('<div></div>');
});
```

Correct approach:

```typescript
test('should render card with title', () => {
  render(<Card title="Test" />);
  expect(screen.getByRole('heading', { name: /test/i })).toBeInTheDocument();
});
```

### 4. Not Using Semantic Queries

Wrong approach:

```typescript
test('should render button', () => {
  render(<MyComponent />);
  expect(screen.getByTestId('submit-button')).toBeInTheDocument();
});
```

Correct approach:

```typescript
test('should render button', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});
```

## Test Naming Conventions

Write descriptive names that explain the behavior being tested.

Good names:

- should disable submit button when form is invalid
- should call onDelete with correct item id when delete is clicked
- should show error message when API request fails

Poor names:

- button test
- it works
- test component

## Keep Tests Focused

### One Primary Assertion Per Test

Good approach:

```typescript
test('should render heading', () => {
  render(<Header title="Welcome" />);
  expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
});

test('should render navigation links', () => {
  render(<Header />);
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
});
```

### Extract Repetitive Setup

```typescript
describe('LoginForm', () => {
  const renderLoginForm = (props = {}) => {
    const defaultProps = {
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    };
    return render(<LoginForm {...defaultProps} {...props} />);
  };

  test('should call onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn();
    renderLoginForm({ onSubmit: handleSubmit });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

## Balance Between DRY and Readability

Do not over-abstract tests. Sometimes repetition is clearer.

Good balance:

```typescript
describe('Button', () => {
  test('should render primary button', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  test('should render secondary button', () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});
```

## Quality Checklist for Component Tests

Before completing component tests, verify:

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
- Tests are focused
- Coverage focuses on behavior

## Success Criteria for Component Tests

Component tests must:

- Test what users see and interact with
- Use semantic queries that promote accessibility
- Verify conditional rendering
- Test all user interactions with concrete expectations
- Validate callback props fire with correct arguments
- Handle edge cases gracefully
- Avoid testing implementation details
- Maintain clean readable test code
- Follow ESLint rules and project conventions
- Achieve meaningful behavior coverage of 85 percent or higher
