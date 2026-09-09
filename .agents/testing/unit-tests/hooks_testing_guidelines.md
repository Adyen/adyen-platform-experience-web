# Vue composable testing guidelines

Before writing tests, identify the composable's inputs, returned refs, side effects, lifecycle hooks, error handling, and cleanup.

## Test behavior

- Assert initial reactive values.
- Trigger public functions and verify resulting refs or callbacks.
- Verify dependency changes and asynchronous updates.
- Mount a minimal Vue app only for lifecycle-dependent behavior.
- Unmount every test app.
- Do not spy on Vue internals such as `ref`, `computed`, or lifecycle registration.
- Prefer data-driven tests for repeated inputs.

Use fake timers for timer behavior and restore them after each test. Keep assertions deterministic and avoid tests that fail only because the implementation was reorganized.
