# Core runtime

## Package identity

`packages/shared/core/src` owns session authentication, configuration, localization, analytics, HTTP communication, assets, and component registration.

## Architecture

- `Core.ts` is the framework-neutral runtime source of truth.
- `session/` owns token refresh and session lifecycle.
- `Localization/` owns translations and formatting.
- `vue/` owns the provider stack and imperative `UIElement` lifecycle.

Each public element extends `UIElement`, which mounts a Vue component through `UIElementProvider`. The provider installs core, configuration, and event-dispatcher state.

Use `useCoreContext()` and `useConfigContext()` from `@integration-components/core/vue` inside Vue components. Do not pass shared runtime state between sibling components manually.

## Session flow

1. The consumer supplies `onSessionCreate`.
2. `AuthSession` manages the token lifecycle.
3. `ConfigProvider` exposes the session and resolved endpoints.
4. Domain components consume those typed endpoints through the Vue context.

## Common checks

- Preserve session error handling when changing request flow.
- Resolve assets through Core rather than hardcoding CDN paths.
- Keep framework-neutral behavior outside `src/vue`.
