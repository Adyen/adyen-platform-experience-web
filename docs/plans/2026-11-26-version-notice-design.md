# Version notice for non-live environments

## Goal

Tell platforms to upgrade the SDK. The notice appears only in the `test` and `beta` environments, so live end users never see it.

- **Deprecated**: the running version is flagged with `npm deprecate`. This applies to stable and prerelease versions.
- **Outdated prerelease**: the running version is a prerelease (`alpha`, `beta`, `rc`, `next`), and a newer version exists on the matching dist-tag of the same major.

## Decisions

| Topic           | Decision                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Source of truth | npm registry, queried from the browser (per-version and per-dist-tag manifests, ~9 KB, CORS `*`)  |
| Deprecated      | `deprecated` field on the running version's manifest (`npm deprecate`)                            |
| Outdated        | prereleases only; compared against `v<major>-<preid>`, falling back to `<preid>`, same major only |
| Visibility      | `environment !== 'live'`                                                                          |
| Placement       | top of every mounted component; one shared check per Core                                         |
| Content         | translated title and description with interpolated versions; the npm message is not shown         |
| Dismissal       | close button, persisted in localStorage per notice                                                |
| Opt-out         | none                                                                                              |
| Loading         | banner component lazy-loaded only when a notice exists                                            |

### Rejected alternatives

- **`/-/package/<pkg>/dist-tags`**: does not send CORS headers, so browsers cannot call it.
- **Full packument**: 122 KB and growing.
- **GitHub API**: unauthenticated limit of 60 requests per hour per IP.
- **CDN manifest**: first-party and CSP-friendly, but needs release-pipeline work. Revisit if CSP blocks become a problem.
- **Banner owns the check (approach B)**: the chunk would download for every non-live user.
- **Vue-only composable (approach C)**: harder to unit-test, and Core would not know about the check.

## Architecture

```
Core.getVersionNotice()  ── memoized per Core, skipped on live
        │  VersionNotice | null
        ▼
UIElementProvider.vue    ── onMounted → ref; checks dismissal
        │  v-if notice
        ▼
VersionNoticeBanner.vue  ── defineAsyncComponent(() => import(...)), BentoAlert
```

### Framework-neutral: `packages/shared/core/src/versionNotice/`

- `constants.ts`: registry URL, package name, `VERSION_NOTICE_STORAGE_KEY = 'adyen-pe-version-notice-dismissed'`.
- `semver.ts`: `parseVersion` and `compareVersions` for `X.Y.Z[-preid.N]`. No new dependency.
- `getVersionNotice.ts`:

    ```ts
    type VersionNotice =
        | { kind: 'deprecated'; currentVersion: string }
        | { kind: 'outdated'; currentVersion: string; latestVersion: string };

    getVersionNotice(version: string, fetchFn = fetch): Promise<VersionNotice | null>;
    ```

    1. `GET /<pkg>/<version>`. If the manifest has a non-empty `deprecated` field, return `deprecated`. This takes precedence over `outdated`.
    2. If the version is a prerelease on a known channel (`alpha`, `beta`, `rc`, `next`), `GET /<pkg>/v<major>-<preid>`. On 404, `GET /<pkg>/<preid>`. If the result has the same major and a strictly greater version, return `outdated`.
    3. Both lookups run in parallel and fail independently: a failed lookup only removes its own kind of notice. Any other HTTP status stops the fallback. The function never throws.

### Core

`public getVersionNotice(): Promise<VersionNotice | null>`:

- Resolves `null` when `options.environment === 'live'`. The gate is evaluated on every call, so `core.update({ environment })` is respected.
- Otherwise returns one promise per Core, created lazily on first call.

### Vue: `packages/shared/core/src/vue/`

- `versionNotice/useVersionNotice.ts`: calls `core.getVersionNotice()` in `onMounted` and exposes the notice unless it was dismissed, plus `dismiss()`.
- `UIElementProvider.vue`:
    - Uses `useVersionNotice(props.core)`.
    - Renders the lazy banner above `ComponentAvailabilityGate`.
    - Defines the async component at module level. If its loader fails, it resolves to an empty component, so the failure never reaches error handlers.
- `versionNotice/VersionNoticeBanner.vue`:
    - Props: `notice`. Emits: `dismiss`.
    - Renders `BentoAlert` with `close-button`. `deprecated` uses `type="warning"`; `outdated` uses `type="highlight"`.
    - Wraps the alert in `role="status"`.
    - Styled with a CSS module and Bento spacing tokens, like the other components in `shared/core/src/vue`.

## Lazy loading

- **npm ESM build**: `preserveModules` keeps the banner in its own file, so the dynamic import is a real split.
- **CDN build**:
    - After `chore/switch-to-esm-for-cdn-build`, the banner becomes a separate chunk, and `cdnModuleIntegrity` covers it with SRI automatically (static specifier).
    - Before that branch merges, the UMD build inlines the banner. It still works, just without the size benefit.
- **CJS build**: inlined.
- **Savings**: `BentoAlert` is already imported statically by Capital, Disputes, and Pay by Link. The chunk mainly saves bytes for live users and for components that do not use `BentoAlert`.

## i18n

Shared strings are duplicated per domain prefix (see `<domain>.common.errors.componentUnavailable`). Resolve them through `useCoreContext()` and `translationDomain`, like `ComponentAvailabilityGate` does.

Add these en-US keys to every domain catalog under `packages/domains/<domain>/vue/translations/`, then run `translations:sort` and `translations:sync`:

| Key                                                    | en-US                                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `<domain>.common.versionNotice.deprecated.title`       | This SDK version is deprecated                                                                             |
| `<domain>.common.versionNotice.deprecated.description` | You're using version %{currentVersion}. Upgrade to the latest version to keep receiving fixes and support. |
| `<domain>.common.versionNotice.outdated.title`         | A newer pre-release version is available                                                                   |
| `<domain>.common.versionNotice.outdated.description`   | You're using version %{currentVersion}. Upgrade to %{latestVersion}.                                       |

## Dismissal

- localStorage key: `adyen-pe-version-notice-dismissed`.
- Value: `"<kind>:<currentVersion>:<latestVersion|''>"`. A different deprecated version, or a newer prerelease, shows the banner again.
- A module-level reactive `Set` of notices dismissed in this session hides the banner in every mounted component at once.
- localStorage access is wrapped in `try/catch`. When storage is unavailable, dismissal falls back to in-memory for the session.

## Error handling

- Network, HTTP, JSON, and parse failures produce no notice and no console noise.
- A failure to load the chunk drops the notice and never breaks the host component.
- Registry requests use plain `fetch`, with no credentials and no SDK or session headers.
- Platforms whose CSP blocks `registry.npmjs.org` see no banner. This is an accepted limitation, to be documented in the changelog.

## Testing (TDD)

- `semver.test.ts`: stable vs prerelease ordering, prerelease numbering, malformed input.
- `getVersionNotice.test.ts`, with `fetchFn` injected:
    - `deprecated` takes precedence over `outdated`.
    - A 404 on `v<major>-<preid>` falls back to `<preid>`.
    - A newer version on a different major produces no notice.
    - An equal version produces no notice.
    - A network error returns `null`.
- `Core.test.ts`:
    - `live` makes no fetch.
    - A single request pair is shared across N calls.
    - `update({ environment: 'live' })` gates the check off.
- `UIElementProvider.test.ts`:
    - The chunk is not imported when the result is `null`.
    - The banner renders when a notice exists.
    - Dismissal persists and is shared across instances.
    - Dismissal falls back to in-memory when storage is blocked.
- `VersionNoticeBanner.test.ts`: Alert type and translation keys for each kind.
- MSW:
    - `mocks/mock-server/versionNotice.ts` answers registry requests with "current version, not deprecated" by default.
    - `SDK/Version notice` stories (Deprecated, Newer pre-release) override that response.
- Playwright integration specs only target mocked stories, so the MSW default keeps them deterministic. The repo has no real-environment e2e project; one added later must stub `registry.npmjs.org`.

## Rollout

- Branch `feature/version-notice` from `develop`, preferably after `chore/switch-to-esm-for-cdn-build` merges.
- Add a note to `RELEASE_CHANNEL_STRATEGY.md`: deprecating versions means running `npm deprecate @adyen/adyen-platform-experience-web@"<range>" "<msg>"`.
