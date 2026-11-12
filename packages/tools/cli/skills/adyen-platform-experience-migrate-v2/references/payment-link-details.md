# PaymentLinkDetails: v1 to v2

| v1          | v2                                                                  |
| ----------- | ------------------------------------------------------------------- |
| `onDismiss` | Removed, no replacement. Delete it and report what the callback did |
| `onUpdate`  | Removed, no replacement. Delete it and report what the callback did |

It has no pagination, `onRecordSelection` or `dataCustomization`. From `references/global.md`, apply only "Props on every component"; also apply `references/css-overrides.md`.

Exact types: `PaymentLinkDetailsProps` in the package's `.d.ts` files.
