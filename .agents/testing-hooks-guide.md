# Hook Testing Guidelines

## Analysis Phase

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

## When writing tests for hooks:

### Behavior vs Implementation Testing

One of the most important principles in testing: **Test WHAT the code does, not HOW it does it.**

**Behavior Testing**: Verify the observable outcomes and user-facing functionality
**Implementation Testing**: Verify internal mechanisms and code structure

### Red Flags: Signs You're Testing Implementation

- Spying on setTimeout or setImmediate to verify timing
- Checking internal variable values not exposed in API
- Testing that React hooks (useEffect, useCallback) are called
- Verifying order of internal function calls
- Mocking internal functions to verify they're called
- Testing error handling mechanisms rather than error outcomes
- Need complex mocking to make test work
- Test breaks when you refactor but behavior doesn't change

## Hook Test Checklist

When writing tests for custom Preact hooks:

### ✓ Initial State

- [ ] Returns correct initial values
- [ ] Handles initial parameters correctly
- [ ] Default values work as expected

### ✓ State Updates

- [ ] Updates state when functions are called
- [ ] Handles multiple sequential updates
- [ ] State persists across re-renders

### ✓ Side Effects

- [ ] useEffect runs at correct times
- [ ] Dependencies trigger re-runs properly
- [ ] Cleanup functions prevent memory leaks

### ✓ Error Handling

- [ ] Handles errors gracefully
- [ ] Sets error state correctly
- [ ] Recovers from errors

### ✓ Edge Cases

- [ ] Handles null/undefined inputs
- [ ] Handles rapid successive calls
- [ ] Handles unmounting during async operations
