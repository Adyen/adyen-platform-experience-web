# CapitalOffer: v1 to v2

The component now runs the whole offer flow itself, so the flow-control callbacks are gone.

| v1               | v2                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `onOfferDismiss` | Removed, no replacement. Delete it and tell the user                                                  |
| `onOfferSelect`  | Removed, no replacement. Delete it and tell the user                                                  |
| `onFundsRequest` | Renamed `onSubmit`. It no longer controls the flow; keep only side effects (analytics, notifications) |

**`getState()`** no longer returns a `state` enum. `CapitalState` is a union: check `isAvailable` first, then `isRegionSupported`; `hasGrants`, `hasRenewableGrants` and `dynamicOfferConfig` only exist when both are `true`. Rewrite each check on `state` with the status fields:

| v1 `state`              | v2 status fields                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isUnqualified`         | `isAvailable === false` (unavailable or undetermined), or `isAvailable && isRegionSupported && !hasGrants && !hasRenewableGrants && dynamicOfferConfig === undefined` (no grants or offer) |
| `isPreQualified`        | `isAvailable && isRegionSupported && !hasGrants && dynamicOfferConfig !== undefined` (`{ currency, minAmount, maxAmount }`)                                                                |
| `hasRequestedGrants`    | `isAvailable && isRegionSupported && hasGrants`; with `hasRenewableGrants && dynamicOfferConfig !== undefined` for early renewals                                                          |
| `isInUnsupportedRegion` | `isAvailable && isRegionSupported === false`                                                                                                                                               |

Exact types: `CapitalOfferProps` and `CapitalState` from the package's `.d.ts`.
