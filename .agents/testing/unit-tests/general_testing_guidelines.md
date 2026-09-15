# Unit testing guidelines

## Repository context

- Framework: Vue 3
- Test runner: Vitest
- File convention: colocate `.test.ts` files with source

## Core principles

- Assert concrete, deterministic behavior.
- Prefer real implementations with controlled inputs.
- Mock external boundaries, not internal helpers.
- Use `vi.mocked()` for typed mocks.
- Reset timers, mocks, and mounted Vue apps after each test.
- Test reactive output and rendered behavior rather than implementation details.

For DOM queries, prefer role, label, placeholder, text, then test ID. Avoid direct DOM traversal when an accessible query is available.

Use fake timers and `vi.setSystemTime()` for time-dependent code. Await asynchronous state changes and clear mocks between tests.

Run focused tests first:

```bash
pnpm run test -- --run path/to/file.test.ts
```

For broad changes, run the complete unit suite and report any skipped checks or existing warnings.
