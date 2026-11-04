# Imports and component instances

v2 exports far fewer names than v1: the internals v1 exposed (HTTP helpers, config and session utilities, constants) are gone, and the public types were renamed. Fix every import from `@adyen/adyen-platform-experience-web` that no longer resolves, using the tables below. The full list of what v2 exports is in the package's `dist/types/packages/sdk/src/index.d.ts`.

## Renamed types

| v1                                                                                                                   | v2                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `<Component>ComponentProps`, e.g. `TransactionsOverviewComponentProps`, `PayoutDetailsComponentProps`                | `<Component>Props`, e.g. `TransactionsOverviewProps`, `PayoutDetailsProps`                                                           |
| `DisputeOverviewComponentProps`                                                                                      | `DisputesOverviewProps`                                                                                                              |
| `CapitalComponentState`, `ExternalCapitalState`                                                                      | `CapitalState` (see the Capital references)                                                                                          |
| `TransactionsListCustomization`, `PayoutsListCustomization`, `ReportsListCustomization`, `DisputesListCustomization` | `TransactionsDataGridCustomization`, `PayoutsDataGridCustomization`, `ReportsDataGridCustomization`, `DisputesDataGridCustomization` |
| `onErrorHandler`                                                                                                     | `ErrorHandler`                                                                                                                       |
| `Locale`                                                                                                             | `SupportedLocales`                                                                                                                   |
| `Translations`, `TranslationSourceRecord`                                                                            | `CustomTranslations` for custom text; locale objects are no longer needed (see `availableTranslations` in `references/global.md`)    |

## Removed, no public equivalent

`*TableFields`, `TransactionDetailsFields`, `DisputeDetailsFields`, `TransactionsFilters`, `StoreIds`, `PaymentLinkCreationFieldsConfig`, `PaymentLinkFieldsVisibilityConfig`, the refund types (`RefundReason`, `RefundMode`, `RefundResult`, ...), and every non-component value v1 exported (`Core`, `http`, `httpGet`, `httpPost`, `API_ENVIRONMENTS`, `CDN_ENVIRONMENTS`, `CURRENCY_DECIMALS`, `ErrorTypes`, ...).

- For a type, derive it from the v2 props instead of redeclaring it, e.g. `NonNullable<TransactionsOverviewProps['dataCustomization']>['dataGrid']`.
- For a value (HTTP helpers, constants), move the logic into the app. Don't import from the package's internal paths.

## Component instance methods

| v1                                                                                             | v2                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `mount(target)`, `update(props)`, `unmount()`, `remove()`                                      | Unchanged                                                                                            |
| `core`, `type`, `displayName`                                                                  | Unchanged                                                                                            |
| `remount()`                                                                                    | Removed. Use `unmount()` then `mount(target)`, or `update(props)` if the goal was to apply new props |
| `props`, `state`, `data`, `setState()`, `setStatus()`, `isValid`, `accessibleName`, `render()` | Removed. Keep the props the app passed in its own variable; don't read state back from the instance  |
| `getState()` on Capital components                                                             | Kept, with new fields (see the Capital references)                                                   |
