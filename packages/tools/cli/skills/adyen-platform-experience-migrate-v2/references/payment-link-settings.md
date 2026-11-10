# PaymentLinkSettings: v1 to v2

| v1                                                    | v2                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `settingsItems`, `embeddedInOverview`, `navigateBack` | Removed. Delete them and report what they did; the component always shows every settings section           |
| (none)                                                | New, optional: `storeIds: string[]` limits the component to those stores (one store hides store selection) |

Also apply `references/global.md` and `references/css-overrides.md`.

Exact types: `PaymentLinkSettingsProps` in the package's `.d.ts` files.
