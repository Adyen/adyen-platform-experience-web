# TODO Review

Inventory of every `TODO` / fix-style comment in the repository, with an analysis of whether to fix it, accept it, or do something else.

## Scope and method

- Searched all tracked sources (`packages/`, `src/`, `eslint.config.cjs`, mocks, tests) for `TODO`, `[TODO]`, `FIXME`, `HACK`, `XXX`, and fix-style phrases ("once this is fixed", "BE returns", "workaround", "temporary", "remove when/after").
- Excluded `node_modules`, `dist`, `coverage*`, `declarations`, JSON files and `CHANGELOG.md`.
- Result: **27 `TODO` comments + 1 fix-style comment** (in a mock), grouped into **14 topics** because several comments share one root cause.
- No `FIXME`, `HACK` or `XXX` comments exist.

Versions relevant to the analysis: `typescript` 5.8.3, `@adyen/bento-vue3` 2.5.0, `vue` ^3.5.42.

## Summary

| #   | Topic                                              | Comments | Location (type)          | Actionable? | Recommendation                                | Blocked by        | Effort |
| --- | -------------------------------------------------- | -------- | ------------------------ | ----------- | --------------------------------------------- | ----------------- | ------ |
| 1   | Refund form inputs have no accessible name         | 8        | Transactions tests → src | Yes         | **Done**: labels use Bento `label` prop       | –                 | S      |
| 2   | Totals/balances expandable card a11y               | 4        | Transactions tests → src | Partly      | **Partly done**: list structure; name blocked | Partly Bento      | M      |
| 3   | `expirePayByLinkPaymentLink` 200 vs 204            | 2        | Types + mock             | Blocked     | **Fix** after confirming BE                   | BE confirmation   | S      |
| 4   | HTTP content-type handling "when backend is ready" | 1        | Core runtime             | Stale       | TODO removed; **fix** the gap (add tests)     | –                 | S      |
| 5   | ESLint `I18n` type exception for PBL schema        | 1        | Lint config              | Yes         | **Done**: type moved, exception removed       | –                 | XS     |
| 6   | ESLint complexity exceptions (3 components)        | 1        | Lint config              | Yes         | **Done**: logic moved to `domain/src`         | –                 | M      |
| 7   | `tabbable.ts` incomplete focusable checks          | 1        | Shared utils             | Stale       | **Done**: module deleted                      | –                 | XS     |
| 8   | `upload.test.ts` DataTransfer stub                 | 1        | Shared utils tests       | Stale       | **Done**: util deleted                        | –                 | XS     |
| 9   | `WithGetSetProperty` waiting on TS upgrade         | 1        | Shared utils types       | Stale       | **Done**: commented code deleted              | –                 | XS     |
| 10  | Core-level `balanceAccountId` option               | 1        | Core public types        | Blocked     | **Delete** comment, track as issue            | Product decision  | XS     |
| 11  | Capital overview analytics "TODO: Verify"          | 3        | Capital src              | Vague       | **Confirm** with analytics owner, then remove | Analytics/product | XS     |
| 12  | Flaky PSP reference test `sleep(100)`              | 1        | Transactions tests       | Yes         | **Done**: sleep removed; Preact-only flake    | –                 | S–M    |
| 13  | Bento filter "misaligned ARIA" in test helpers     | 2        | Shared Playwright utils  | Vague       | **Accept** / clarify, possibly Bento issue    | Bento             | XS     |
| 14  | PBL `SecondaryNav` should use `BentoSecondaryNav`  | 1        | PayByLink src            | Blocked     | **Accept** for now, file Bento request        | Bento             | –      |

Effort scale: XS < 1h, S ≈ half a day, M ≈ 1–2 days.

"Actionable?" describes the TODO comment as written:

- **Yes**: the comment describes work the team can do now.
- **Partly**: part of the work can be done now; the rest is blocked (see "Blocked by").
- **Blocked**: the work waits on someone outside the code (backend, product, Bento). Code changes can't start until that answer or release arrives.
- **Vague**: the comment doesn't say what to do. Someone (usually the author) has to clarify it before it can be acted on, and it may turn out not to be a bug.
- **Stale**: the condition the TODO waited for has passed, or the code it refers to is unused. The work it asks for no longer makes sense. The real action is deleting the code or comment, or, for #4, fixing a separate gap found nearby.

Suggested order: quick wins first (5, 7, 8, 9, 10), then the user-facing a11y bugs (1, 2), then the BE/HTTP pair (3, 4), then 6 and 12 as background work. Items 11, 13, 14 need someone outside the code to answer.

---

## 1. Refund form inputs have no accessible name

**Comments (8)**

- `packages/domains/transactions/vue/tests/integration/TransactionDetails/default.spec.ts:101, 103, 131, 170, 208, 212`
- `packages/domains/transactions/vue/tests/integration/TransactionDetails/refundableFullAmount.spec.ts:23`
- `packages/domains/transactions/vue/tests/integration/TransactionDetails/refundablePartialAmount.spec.ts:23`

```ts
// [TODO]: Address missing ARIA label association with spinbutton (number input)
const amountInput = page.getByRole('spinbutton', { /*name: 'Amount to refund', exact: true,*/ disabled: false });
// [TODO]: Address missing ARIA label association with combobox (refund reason select dropdown)
const reasonSelect = page.getByRole('combobox', { /*name: 'Reason for refund', exact: true,*/ ... });
```

**Root cause**

The comments live in tests, but the bug is in the components:

- `TransactionDetails/components/PaymentRefund/PaymentRefundAmount.vue`
- `TransactionDetails/components/PaymentRefund/PaymentRefundReason.vue`

Both render their label as a standalone `<BentoTypography>` next to the field. Nothing connects that text to the `<input>` / combobox, so screen readers announce an unnamed field. This fails WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value).

**Viability: high**

Bento 2.5.0 supports this already:

- `BentoInputField` has a `label` prop and forwards `aria-*` attributes to the inner input.
- `BentoDropdown` has a `label` prop (it generates its own label id and `aria-labelledby`).

Options:

1. Use the Bento `label` prop and drop the custom `BentoTypography` heading. Cleanest; changes the visual style of the label to the Bento default, so it needs a quick design check.
2. Keep the current visual, give the `BentoTypography` an id (`useUniqueId()`), and pass `aria-labelledby` to the field. No visual change.

**Recommendation: fix.** The commented-out `name:` filters in the tests are already the failing tests that reproduce the bug (matches the repo's "test first" rule): uncomment them, see them fail, fix the components, remove the 8 TODOs.

**Status: done.** The `name:` filters were re-enabled first and 6 tests failed with "element not found". `PaymentRefundAmount.vue` and `PaymentRefundReason.vue` now pass the label to `BentoInputField` / `BentoDropdown` through their `label` prop (the same pattern the PayByLink forms use). The custom label row and its `inputHead` style were removed. All 39 `TransactionDetails` specs pass.

---

## 2. Totals and balances expandable cards: accessible name and hierarchy

**Comments (4)**

- `TransactionsOverview/default.spec.ts:72` and `singleBalanceCurrency.spec.ts:35`: "Fix accessible names for the totals and balances expandable cards"
- `TransactionsOverview/errorList.spec.ts:40` and `emptyList.spec.ts:54`: "Define proper accessibility hierarchy for expandable card"

**Root cause**

`Balances.vue` and `TransactionTotals.vue` use `<BentoCard expandable>`. Bento puts `role="button"` on the card header wrapper, so the button's accessible name is the whole header text (for example "Available balance 1,000.00 USD Reserved balance …"). That is why the tests match names with prefix regexes like `/^Available balance/` and `/^Total/`. `BentoCard` 2.5.0 has no prop for an explicit accessible name.

There is also a structural problem in our own code: `BalanceItem.vue` and `TransactionTotalItem.vue` render `role="listitem"` without any `role="list"` parent, which is invalid ARIA. The first item sits inside the header button, where children are presentational, so its list semantics are dropped anyway.

**Viability: medium**

What we can fix in our code:

- Wrap the expanded items in an element with `role="list"` (or use `<ul>`/`<li>`), and stop marking the header item as a list item.
- Give the toggle a concise name, for example by adding a visually hidden text at the start of the header slot ("Account balances", "Transaction totals"), with new i18n keys.

What needs Bento:

- A proper `ariaLabel`/`ariaLabelledby` prop on `BentoCard` for expandable cards would be cleaner than a hidden text. Worth a feature request.

**Recommendation: fix partially now** (list semantics + hidden label), file a Bento request for a card label prop. Agree the target structure with whoever owns a11y first, since the comments ask to "define" the hierarchy. Update the four tests to use exact names afterwards.

**Status: partly done.**

- Done (the two "hierarchy" TODOs): the expanded currencies are now inside a `role="list"` and the header item (inside the toggle button) is no longer a `role="listitem"`. `emptyList.spec.ts` and `errorList.spec.ts` check this structure, and `default.spec.ts` checks it for balances and totals. With the old components, 4 of these specs failed.
- Not possible from our code (the two "accessible names" TODOs): the hidden-text idea in the recommendation above does not work. A button named from its content always includes the whole header text, so extra text would only make the name longer. `BentoCard` 2.5.0 has no label prop, and attributes passed to it land on the card root, not on the `role="button"` header. Both TODOs were reworded to say they wait for a Bento prop. A Bento request is still needed.

---

## 3. `expirePayByLinkPaymentLink` returns 200 instead of 204

**Comments (2, one root cause)**

- `packages/shared/types/src/api/endpoints.ts:33`

    ```ts
    // TODO: Remove exception for expirePayByLinkPaymentLink after BE changes the response from 200 to 204
    type JSONEndpoints = Exclude<EndpointName, DownloadStreamEndpoint | 'expirePayByLinkPaymentLink'>;
    ```

- `packages/domains/payByLink/mocks/mock-server/payByLink.ts:494` (fix-style comment, not tagged TODO)

    ```ts
    // BE returns 200 instead of 204. Once this is fixed replace the following line with `return new HttpResponse(null, { status: 204 });`
    return HttpResponse.json(undefined, { status: 200 });
    ```

**Findings**

- The generated OpenAPI type already declares **only a `204` response** for this operation (`resources/PayByLinkResourceV1.ts:681`). So the spec says the BE answers 204; whether the deployed BE does is unconfirmed.
- Removing the exception is not a one-line change. `EndpointJSONData<T>` reads `responses[200]`, so a 204-only endpoint would break type-checking. Today `EndpointData<'expirePayByLinkPaymentLink'>` resolves to `never`, which works only because the caller ignores the result.
- `http.ts` already returns `null` for 204. Its "empty JSON body" guard (`Response from … has an empty body`) was added in the same commit as this workaround (`556eba7be`, PBL details), most likely to tolerate this BE behaviour.

**Viability: high, once BE is confirmed**

1. Check the real response on the test environment (or ask the PBL BE team).
2. If it is 204:
    - Change the mock to `new HttpResponse(null, { status: 204 })`.
    - Replace the hard-coded exclusion with a generic type, e.g. `NoContentEndpoints` (operations without a `200` response) mapped to `null` in `EndpointData`. That handles future 204 endpoints too.
    - Remove both comments.
    - Optionally keep the empty-body guard in `http.ts` as defensive code (see item 4).
3. If it is still 200: keep as is, but update the TODO to link the BE ticket.

---

## 4. HTTP content-type handling: "when backend is ready double check this logic"

**Comment**

- `packages/shared/core/src/Http/http.ts:67` — `//TODO: when backend is ready double check this logic`

**Findings**

- Introduced on 2024-07-18 (`a2f334c40`, "Add download endpoint mock"), when CSV downloads were added. Those endpoints (`downloadReport`, `downloadTransactions`, `downloadDefenseDocument`) have been live since, so the "backend is ready" condition is long past.
- The logic itself has a real gap: every successful response whose `Content-Type` is not exactly `application/json` is treated as a file download and returned as `{ blob, filename }`. That includes a missing `Content-Type` header, `application/problem+json`, and vendor `+json` types. A JSON endpoint that loses its header would silently return a blob.
- There are no unit tests in `packages/shared/core/src/Http/`.

**Viability: high**

- Add `http.test.ts` covering: JSON, JSON with `charset`, empty JSON body, 204, `text/csv`, `application/pdf`, missing `Content-Type`.
- Consider treating `*/*+json` as JSON, and deciding explicitly what a missing header means (probably JSON for non-download endpoints).
- Remove the TODO.

**Recommendation: fix.** Small, self-contained, and it protects every component's data fetching.

**Status:** the stale TODO comment has been removed. The content-type gap and the missing unit tests are still open.

---

## 5. ESLint exception: payment link schema imports the Vue-layer `I18n` type

**Comment**

- `eslint.config.cjs:384-385`

    ```js
    // TODO: Known exception: the payment link schema types its translator with the Vue-layer `I18n` type.
    // Move that type to the framework-neutral core, then remove this entry.
    ```

**Findings**

- `packages/domains/payByLink/domain/src/PaymentLinkCreation/schema.ts` imports `type { I18n } from '@integration-components/core/vue'`.
- `I18n` is defined in `packages/shared/core/src/vue/Context/types.ts`, but it only depends on `Localization` and the `translations` types. It has no Vue dependency; it just lives in the wrong folder.

**Viability: high**

- Move `I18n` to a framework-neutral module (e.g. `core/src/Localization/types.ts` or `core/src/translations`), export it from `@integration-components/core`, and re-export it from `core/vue` so existing imports keep working.
- Change the import in `schema.ts` and `schema.test.ts`, then remove the `ignores` entry.

**Recommendation: fix.** Quick win.

**Status: done.** `I18n` now lives in `core/src/Localization/types.ts` and is exported from `@integration-components/core`. `core/vue` re-exports it, so existing imports still work. `schema.ts` and `schema.test.ts` import it from the core root, and the `ignores` entry is removed from `eslint.config.cjs`.

---

## 6. ESLint complexity exceptions for three components

**Comment**

- `eslint.config.cjs:370` — "Known exceptions, above the limit before it was introduced. Extract their logic, then remove them here."

**Current complexity (limit 15)**, measured by running ESLint with the rule forced on:

| File                                                                  | Function                | Complexity |
| --------------------------------------------------------------------- | ----------------------- | ---------- |
| `transactions/.../PaymentDetails/PaymentDetailsProperties.vue`        | arrow function, line 56 | 22         |
| `disputes/.../DisputeManagement/components/DisputeDataProperties.vue` | arrow function, line 91 | 21         |
| `payByLink/.../Form/Summary/FormSummary.vue`                          | `renderValue`, line 36  | 21         |

**Viability: high, but needs care**

Each file has one offending function. Moving that decision logic to `domain/src` (or a composable) with unit tests matches the intent of the rule and raises measured coverage. The risk is behaviour regressions in detail views, so each extraction needs unit tests written against the current behaviour first.

**Recommendation: fix incrementally**, one component per PR, removing its line from `ignores` each time.

**Status: done.** The offending logic of the three components moved to pure functions in `domain/src`, each with unit tests, and the three `ignores` entries and the TODO were removed from `eslint.config.cjs`. The complexity rule now applies to these files and lint passes.

| Component                      | New function                                                            | Unit tests |
| ------------------------------ | ----------------------------------------------------------------------- | ---------- |
| `PaymentDetailsProperties.vue` | `getPaymentDetailsItems` (`transactions/domain/.../TransactionDetails`) | 14         |
| `DisputeDataProperties.vue`    | `getDisputeDetailItems` (`disputes/domain/.../DisputeManagement`)       | 24         |
| `FormSummary.vue`              | `getSummaryFieldValue` (`payByLink/domain/.../PaymentLinkCreation`)     | 27         |

The three changes were done together, not one per PR as first suggested: they are the same kind of move and are small. The unit tests were written from the old code, not run against it. The existing integration specs of the three views (87 specs) pass and cover the components themselves.

---

## 7. `tabbable.ts`: "Include all of these checks"

**Comment**

- `packages/shared/utils/src/primitives/dom/tabbableRoot/tabbable.ts:76` — `isFocusable` implements 4 of 8 listed checks (missing: inert subtree, `visibility: hidden`, `<details>`/`<summary>`, disabled `<fieldset>`).

**Findings**

- The whole module (`withTabbableRoot`, `isFocusable`, `isTabbable`, `focusIsWithin`, `getDeepActiveElement`, `SELECTORS`) has **no consumers**. It is only re-exported from `packages/shared/utils/src/index.ts`. `@integration-components/utils` is a private package, so nothing outside the repo depends on it.
- It looks like a leftover from the pre-Vue internal components, since the Vue components rely on Bento for modals, popovers and dropdowns.

**Recommendation: delete** `tabbable.ts`, `tabbable.test.ts` and the index export instead of completing the checks. Completing them would be real work (computed styles, ancestor walks) for code nobody calls. If a focus trap is needed later, prefer the `tabbable`/`focus-trap` npm packages or Bento.

**Status: done.** `tabbable.ts`, `tabbable.test.ts` and the index export were deleted.

---

## 8. `upload.test.ts`: DataTransfer stub

**Comment**

- `packages/shared/utils/src/file/upload.test.ts:24` — "Replace this stub with a DOM drop event to cover complete DataTransfer semantics."

**Findings**

- `getUploadedFilesFromSource` has **no consumers** outside its own test (only re-exported from the utils index).
- The suggested fix is not possible in the current test environment: jsdom does not implement `DataTransfer` or `DragEvent` (both `undefined`). It would need Vitest browser mode or a Playwright test.

**Recommendation: delete** `upload.ts`, `upload.test.ts` and the index export. If the util is kept for a future upload feature, accept the stub and reword the comment to explain the jsdom limitation instead of leaving a TODO.

**Status: done.** `upload.ts`, `upload.test.ts` and the index export were deleted.

---

## 9. `WithGetSetProperty`: "Make available when TS version has been updated"

**Comment**

- `packages/shared/utils/src/struct/types.ts:12` — commented-out type with a getter/setter pair of different types. Written in May 2024.

**Findings**

- The repo is on TypeScript 5.8.3. Different getter/setter types are supported since TS 4.3, and unrelated types since TS 5.1, so the blocker is gone.
- The type has no consumers, and nothing has needed it in over two years.

**Recommendation: delete** the commented-out block. Re-add it when there is a real use.

**Status: done.** The commented-out block was deleted.

---

## 10. Core-level `balanceAccountId` option

**Comment**

- `packages/shared/core/src/types.ts:17` — `// [TODO]: Expose when expected behavior has been decided` above a commented-out `balanceAccountId?: string` in `CoreOptions`.

**Findings**

- This is the public `CoreOptions` type, so exposing it is an API decision, not a code task.
- Components already accept `balanceAccountId` individually (`TransactionsOverview`, `PayoutsOverview`, `DisputesOverview`). Open questions for a core-level option: precedence over component props, behaviour for components without balance accounts, and what happens on `core.update()`.

**Recommendation: delete the comment** and track the idea in an issue or product backlog, where the decision belongs. Commented-out public API in a types file tends to stay forever.

---

## 11. Capital overview analytics: "TODO: Verify"

**Comments (3)**

- `packages/domains/capital/vue/src/CapitalOverview/components/CapitalOverview/CapitalOverview.vue:32, 47, 60`

They sit on the `Landed on page` event (with `hasOffer`, `isEarlyRenewal`, `hasGrants`) and two `Clicked button` events (`Open offer`, `Dismiss offer`), all with `subCategory: 'Grants overview'`.

**Findings**

- Added in `18e7f43eb` ("Improve capital overview", 2026-09-14). That commit is the first appearance of the `Open offer` / `Dismiss offer` labels, so there is no earlier implementation to compare against.
- The events are already asserted by integration tests (`eligible.spec.ts`, `firstTimeEligible.spec.ts`, `earlyRenewal.spec.ts`), so the code does what it says. What is unverified is whether the **taxonomy** (event names, labels, sub-category, extra properties) matches the analytics tracking plan.
- "Verify" without context will be impossible to act on for anyone except the author.

**Recommendation: confirm** with the analytics/product owner (or the commit author), adjust the fixtures if needed, then remove the three comments. Code effort is trivial once answered.

---

## 12. Flaky PSP reference filter test: temporary `sleep(100)`

**Comment**

- `packages/domains/transactions/vue/tests/integration/TransactionsOverview/shared/utils.ts:85`

    ```ts
    // [NOTE]: Adding a tiny subsecond delay before clicking the "Reset" button to reduce flakiness
    // [TODO]: Remove this temporary sleep when the root cause of flakiness has been addressed
    await sleep(100);
    ```

**Findings**

- The sleep is in `resetPspReferenceFilter`, right before clicking `Clear` in the filter dialog. A possible cause is a race: the dialog is clickable before the filter's internal state (or the analytics event from the previous step) has settled, so the click is lost or emits the wrong events. This is a guess and was never tested.
- The sleep did not start with the Vue tests. It entered on 2026-02-13 (merge `68ac28677`, branch `test/transaction-overview-V2`) in the Preact integration tests, and `4b961403e` (2026-06-30) only copied it into the Vue suite. At `4b961403e` the test that uses it was disabled with `test.fixme`, so the copied sleep had never been exercised in the Vue suite.
- The root cause has not been identified (see the status below for what was reproduced).

**Viability: medium**

1. Remove the sleep and run the specs that call this helper with `--repeat-each=50` locally and on CI.
2. If it still flakes, capture a Playwright trace and replace the sleep with a web-first wait on the real condition (e.g. `Clear` enabled, input value populated, or the expected analytics count).
3. If the flake is in Bento's filter, keep the sleep and link a Bento issue.

**Recommendation: investigate.** Test-only change, low risk.

**Status: done. The flake was real in the Preact filters and does not reproduce with the Vue/Bento filters. The exact mechanism is still unknown.** The sleep, its comments and the unused `sleep` import were removed from `resetPspReferenceFilter`. Only one test uses the helper (`should reset previous valid input`).

**Test at the original commit (Preact era, merge `68ac28677`).** I checked out that commit in a temporary worktree (Playwright 1.56.0, npm install; the lockfile there was out of sync, so some dependency versions may differ from the originals) and ran the test 300 times with `--workers=8`:

| Run at `68ac28677` | Passed | Failed | Failures                                                                                                     |
| ------------------ | ------ | ------ | ------------------------------------------------------------------------------------------------------------ |
| Without the sleep  | 255    | 45     | 38 lost "Reset" clicks (filter button still showed `PSP0000000000056`), 7 "dialog not found" after a re-open |
| With the sleep     | 292    | 8      | 0 lost "Reset" clicks, 8 "dialog not found" after a re-open                                                  |

- The sleep fixed the lost "Reset" click in the Preact filters (about 13% of runs without it, 0 with it). So the original flake was real and the sleep was a working workaround.
- A second, smaller race (about 2.5% of runs) shows with or without the sleep: the dialog is not open after clicking the filter button to re-open it. The sleep never covered it.
- The test does not show which part of the Preact filter caused the lost click. Probably the click runs before the component has attached its handlers or finished re-rendering, but this was not verified.

**Test with the current Vue/Bento filters.** The Preact domains were removed on 2026-09-09. With the Vue/Bento filters, 300 repeats with `--workers=8` each unless noted:

| Run                    | Passed | Failed | Failure reason                               |
| ---------------------- | ------ | ------ | -------------------------------------------- |
| With sleep, 50 repeats | 50     | 0      | –                                            |
| Without sleep, 50      | 50     | 0      | –                                            |
| Without sleep, run 1   | 298    | 2      | not captured                                 |
| Without sleep, run 2   | 299    | 1      | `beforeEach` timeout (story load)            |
| Without sleep, run 3   | 300    | 0      | –                                            |
| With sleep             | 297    | 3      | all 3 are `beforeEach` timeouts (story load) |

The rare failures happen in the `beforeEach` hook, before the reset helper runs, and they happen with the sleep too. The reset step showed no lost click in these runs, which is a clear contrast with the Preact result above. A flake rarer than about 1 in 900, or one that only shows on CI hardware, cannot be ruled out. If the test flakes on CI, replace the sleep with a wait on a real condition (for example the `Clear` button being enabled) instead of restoring it. The `beforeEach` timeouts under heavy parallel load are a separate issue that is not tracked here.

---

## 13. Bento filters: "Address misaligned ARIA labels and attributes"

**Comments (2)**

- `packages/shared/testing/src/playwright/utils/filters/balanceAccount/BentoBalanceAccountFilter.ts:9`
- `packages/shared/testing/src/playwright/utils/filters/datePicker/BentoDatePicker.ts:11`

**Findings**

- These are Playwright page-object helpers. The filter trigger button is matched by prefix regex (`/^Balance account/`, `/^Date range/`) because Bento includes the selected value in the button's accessible name, while the dialog is named with the bare label.
- That behaviour comes from Bento's filter components. Including the current value in a filter button's name is arguably correct, so it is not clear there is a bug.
- The comment does not say which labels or attributes are "misaligned".

**Recommendation: accept.** Ask the author what was meant. If there is a concrete Bento defect, file it with Bento and link it; otherwise reword the comment to explain why prefix matching is used, and remove the TODO.

---

## 14. PayByLink settings `SecondaryNav`: switch to `BentoSecondaryNav`

**Comment**

- `packages/domains/payByLink/vue/src/PaymentLinkSettings/components/SecondaryNav.vue:2` — "Replace BentoList with BentoSecondaryNav once it supports a non-dropdown mobile presentation."

**Findings**

- `BentoSecondaryNav` exists in Bento 2.5.0, but it always switches to a dropdown at the `s` breakpoint and below. Its only props are `items`, `value` and `allowExpandableItemNavigation`, so there is no way to opt out.
- The current `BentoList` implementation works, is keyboard accessible (native `<button>`s, `aria-current`), and is covered by the `secondary-nav-chevron` test id.

**Recommendation: accept for now.** File a Bento feature request for a non-dropdown mobile mode and put the issue link in the comment, so the TODO can be acted on when Bento ships it.

---

## Items intentionally left out

- Explanatory comments that mention "until", "later" or "temporary" but describe current behaviour (e.g. `TransactionsFilters.vue:89`, `TransactionsOverviewList.vue:61`, `ComponentAvailabilityGate.ts`, the "Error (temporary) - Offer" stories). These are not pending work.
- `eslint-disable`, `@ts-ignore` and `@ts-expect-error` suppressions. They are a related kind of debt but were outside this review; they could be a follow-up inventory.
