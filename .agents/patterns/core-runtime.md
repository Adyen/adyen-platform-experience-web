# src/core/ — Core Runtime

## Package Identity

Core runtime powering all external components. Manages session authentication,
configuration context, localization (i18n), analytics, and HTTP communication.

## Directory Layout

| Directory                | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `ConfigContext/`         | Session provider, auth session management, endpoint resolution     |
| `ConfigContext/session/` | `AuthSession` class — token refresh, session lifecycle             |
| `Context/`               | Preact context providers: `CoreProvider`, `AnalyticsProvider`      |
| `Localization/`          | i18n system: locale loading, translation resolution, formatting    |
| `Analytics/`             | Analytics event tracking, user events, custom translation payloads |
| `Http/`                  | HTTP client utilities, error types, request handling               |
| `Errors/`                | Error classes and error handling utilities                         |

## Key Files

- **`core.ts`** — `Core` class: main entry point, manages components, localization, session
- **`types.ts`** — `CoreOptions`, `onErrorHandler`, core configuration types
- **`utils.ts`** — Environment resolution (`resolveEnvironment`), CDN config helpers
- **`constants.ts`** — Shared core constants

## Architecture

### Core Class (`core.ts`)

The `Core` class is instantiated by the `AdyenPlatformExperience()` factory in `src/index.ts`.
It manages:

- **Component registry**: `registerComponent()`, `remove()`, `update()`
- **Localization**: `Localization` instance with i18n, locale, custom translations
- **Session**: `AuthSession` for API authentication
- **Assets**: CDN image/dataset/config resolution

### Provider Stack

`UIElement.render()` wraps every external component in:

```
ConfigProvider(session, type)
  → CoreProvider(i18n, assets, errorHandler)
    → AnalyticsProvider(componentName)
      → component content
```

Access providers via hooks:

- `useCoreContext()` — i18n, assets, loading context, error handler
- `useConfigContext()` — session, endpoints, extra config

### Session Flow

1. Consumer calls `onSessionCreate` callback to get a session token
2. `AuthSession` manages token lifecycle, refresh, and error handling
3. `ConfigProvider` exposes session context + resolved API endpoints to components
4. Endpoints are typed and consumer code accesses them through `useConfigContext().endpoints`

See `src/types/api/endpoints.ts` for the typed endpoint list.

## Common Gotchas

- **Environment resolution**: `resolveEnvironment()` in `utils.ts` maps environment strings to API/CDN URLs
- **Session errors**: Set `session.errorHandler` for external error reporting
- **Loading context**: Override API base URL via `loadingContext` option or `VITE_APP_LOADING_CONTEXT` env var
- **CDN vs local assets**: Controlled by `VITE_LOCAL_ASSETS` — in dev/test, assets load from local `/assets`

## JIT Find Commands

```bash
rg -n "useCoreContext\|useConfigContext" src/                  # Context usage
fd "AuthSession.ts" src/core/ConfigContext/session/            # Runtime session wrapper
fd "SetupContext.ts" src/core/ConfigContext/session/           # Runtime endpoint resolution
```
