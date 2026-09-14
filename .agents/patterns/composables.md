# Vue composables

## Package identity

Shared Vue composables live in `packages/shared/composables-vue/src`. Domain-specific composables live beside their domain components under `packages/domains/<domain>/vue/src`.

## Conventions

- Prefix composables with `use`.
- Use Vue refs, computed values, and lifecycle hooks from `vue`.
- Return stable reactive state and functions.
- Keep network and business logic framework-neutral when it can live in a domain or shared package.
- Colocate unit tests with the composable using `.test.ts`.

## Testing

Test public reactive behavior rather than Vue internals. Mount a minimal Vue app only when lifecycle behavior requires it, and always unmount the app after each test.

```bash
pnpm run test -- --run packages/shared/composables-vue
```
