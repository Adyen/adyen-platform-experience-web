# CapitalOverview: v1 to v2

The component now runs the whole flow itself, so the flow-control options are gone.

| v1                      | v2                      |
| ----------------------- | ----------------------- |
| `onOfferDismiss`        | Removed, no replacement |
| `onOfferOptionsRequest` | Removed, no replacement |
| `onFundsRequest`        | Removed, no replacement |
| `skipPreQualifiedIntro` | Removed, no replacement |

Delete each removed option and tell the user which ones were dropped.

**`getState()`** no longer returns a `state` enum. `CapitalState` is a union: check `isAvailable` first; the other fields only exist when it is `true`:

| v1 `state`              | v2 status fields                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `isUnqualified`         | `isAvailable === false`, or `isAvailable && isRegionSupported && !hasGrants && !hasRenewableGrants && dynamicOfferConfig === undefined` |
| `isPreQualified`        | `isAvailable && isRegionSupported && !hasGrants && !hasRenewableGrants && dynamicOfferConfig !== undefined`                             |
| `hasRequestedGrants`    | `isAvailable && isRegionSupported && hasGrants` (`hasRenewableGrants` tells whether they can be renewed early)                          |
| `isInUnsupportedRegion` | `isAvailable && isRegionSupported === false`                                                                                            |

Exact types: `CapitalOverviewProps` and `CapitalState` from the package's `.d.ts`.
