# PaymentLinksOverview: v1 to v2

| v1                                                                               | v2                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paymentLinkCreation: { fieldsConfig, onPaymentLinkCreated, onCreationDismiss }` | Removed. The built-in creation form opens without prefilled or locked fields, and no callback fires. Delete it and report what it configured. If the app needs those fields, it can open its own `PaymentLinkCreation` component with `fieldsConfig` and `onCreate` |
| `paymentLinkSettings`                                                            | Removed. Delete it and report what it configured                                                                                                                                                                                                                    |
| (none)                                                                           | New, optional: `storeIds: string[]` limits the component to those stores (one store hides store selection)                                                                                                                                                          |

Also apply `references/global.md` and `references/css-overrides.md`.

Exact types: `PaymentLinksOverviewProps` in the package's `.d.ts` files.
