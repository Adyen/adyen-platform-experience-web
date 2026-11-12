# PaymentLinkCreation: v1 to v2

| v1                     | v2                                                                  |
| ---------------------- | ------------------------------------------------------------------- |
| `onPaymentLinkCreated` | Renamed `onCreate`, same behaviour                                  |
| `fieldsConfig`         | Unchanged                                                           |
| `onShowDetails`        | Removed, no replacement. Delete it and report what the callback did |
| `storeIds`             | Unchanged (`string \| string[]`)                                    |

Exact types: `PaymentLinkCreationProps` from the package's `.d.ts`.
