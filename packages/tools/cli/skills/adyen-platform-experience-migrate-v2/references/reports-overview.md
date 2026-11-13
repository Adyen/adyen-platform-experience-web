# ReportsOverview: v1 to v2

| v1                  | v2                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onRecordSelection` | Removed, no replacement: v2 Reports has no record selection. Delete it and report what it did. Don't rename it to `showDetails`, which doesn't exist here |

Also apply `references/global.md` (shared props, pagination, `dataCustomization`) and `references/css-overrides.md`.

Exact types: `ReportsOverviewProps` in the package's `.d.ts` files.
