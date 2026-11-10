# PaymentLinkCreation: v1 to v2

| v1                     | v2                                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onPaymentLinkCreated` | Renamed `onCreate`, same behaviour                                                                                                                              |
| `fieldsConfig`         | Unchanged                                                                                                                                                       |
| `onShowDetails`        | Removed, no replacement. Delete it and report what the callback did                                                                                             |
| (none)                 | New `storeIds: string[]` limits the component to those stores; one store hides store selection. Only add it if the app already restricted stores some other way |

Exact types: `PaymentLinkCreationProps` from the package's `.d.ts`.
