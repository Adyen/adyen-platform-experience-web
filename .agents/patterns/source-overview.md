# Source overview

## Package layout

- `packages/sdk/`: published package entry and build.
- `packages/domains/<domain>/domain/`: framework-neutral business logic and API types.
- `packages/domains/<domain>/vue/`: Vue components, composables, stories, and integration tests.
- `packages/domains/<domain>/publish/`: public domain exports.
- `packages/shared/core/`: runtime, session, localization, and Vue providers.
- `packages/shared/composables-vue/`: reusable Vue composables.
- `packages/shared/{types,utils,style,assets,testing}/`: framework-neutral shared packages.
- `packages/tools/storybook/`: Vue Storybook application.
- `src/`: compatibility entry for the Core factory and global setup.

## Conventions

- Use Vue 3 and `.vue` single-file components for UI.
- Keep domain logic free of framework imports.
- Name public wrappers `{Name}Element.ts` and extend `UIElement`.
- Colocate unit tests as `.test.ts`.
- Use the `adyen-pe-` CSS prefix and Bento design tokens.
- Export public components through each domain's `publish` layer.

## Pre-PR checks

```bash
pnpm run types:check
pnpm run lint
pnpm run test -- --run
pnpm run build
```
