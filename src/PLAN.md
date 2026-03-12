# IEX-2295 — Framework-agnostic Playwright selector migration plan

## Goal

Refactor Playwright selectors so the integration and E2E suites can run against both the current Preact build and the future Vue + Bento build without failing on framework-specific DOM differences.

## Inputs reviewed

- YouTrack issue `IEX-2295`
- `playwright.config.ts`
- `.agents/testing/integration-and-e2e.md`
- Shared Playwright helpers and models under `tests/utils/` and `tests/models/`
- Current selector usage in `tests/integration/` and `tests/e2e/`
- Existing `data-testid` / `data-testId` usage in `src/`

## Current state

- The suite already uses many accessible selectors (`getByRole`, `getByLabel`, `getByText`).
- The remaining framework-coupled selectors are concentrated in shared helpers, page objects, and a few large test clusters.
- `playwright.config.ts` does not override Playwright's default test id attribute, so the target convention should be `data-testid`.
- There are existing `data-testId` usages in `src/components/internal/FilterBar/FilterBar.tsx` and `src/components/internal/FormFields/FileInput/components/Dropzone.tsx`; these should be normalized as part of the migration.

## Confirmed hotspots

### Shared helpers / page objects

- `tests/utils/datePicker.ts`
- `tests/utils/utils.ts`
- `tests/models/internal-components/dataGrid.ts`
- `tests/models/external-components/transactionDetails.page.ts`
- `tests/models/external-components/transactionsOverview.page.ts`

### Large spec clusters still using framework-coupled selectors

- `tests/integration/components/transactionDetails/`
- `tests/integration/components/disputeManagement/`
- `tests/integration/components/paymentLinkCreation/`
- `tests/integration/components/paymentLinksSettings/`
- `tests/integration/components/transactionsOverview/`
- `tests/integration/components/payoutDetails/`

### Internal components likely to need stable hooks

- Date picker / calendar surfaces
- Payment link form field containers and validation message surfaces
- File input / dropzone surfaces
- Tag and alert state/variant assertions
- Transaction details value rows
- Export popover and other shared overview surfaces where role/label/text is not sufficient

## Constraints

- Do not rely on `.adyen-pe-*` classes, DOM ancestry, or framework-specific structure in Playwright selectors.
- Prefer this selector order: `getByRole` -> `getByLabel` -> `getByText` -> `getByTestId`.
- Add `data-testid` only when accessible selectors are not sufficient for a stable assertion.
- Keep the suite green against the current Preact build while preparing for Vue parity.
- Avoid broad changes to component behavior; only add the minimum stable hooks needed for tests.

## Out of scope

- Rewriting unrelated assertions that are already framework-agnostic
- Visual or behavioral redesign of internal components
- Translation changes unless a selector migration requires an existing i18n-backed accessible name to be exposed correctly

## Phased plan

### Phase 1 — Baseline audit and selector rules

1. Finalize a repo-wide inventory of disallowed selector patterns in Playwright tests:
    - `.adyen-pe-*`
    - `xpath=`
    - raw DOM structure queries such as `locator('dd')`, `locator('dl')`, `nth()`/`first()`/`last()` when used as the primary selector strategy
    - attribute selectors tied to implementation details (`input[name=...]`, `div[name=...]`, `button[title="Select option"]`, `[aria-labelledby=...]`) when an accessible or test-id selector should exist instead
2. Group findings by shared helper, page object, and component domain so the migration can be done in controlled batches.
3. Define the replacement rule for each pattern before editing tests:
    - accessible selector available already
    - accessible selector missing but can be exposed without changing behavior
    - explicit `data-testid` required

**Exit criteria**

- Every known framework-coupled selector pattern is categorized.
- A replacement path exists for each hotspot before broad refactoring starts.

### Phase 2 — Add stable hooks to shared UI primitives

1. Normalize the test-id attribute convention to `data-testid` in source components.
2. Add or expose stable hooks only where accessible selectors are insufficient, prioritizing reusable primitives:
    - calendar / date picker surfaces used by shared helpers
    - form field wrapper and field-level validation surfaces used by payment link flows
    - file upload controls where multiple uploaders can exist on the same screen
    - tag / alert state surfaces where tests currently infer status from CSS variants
    - transaction details value rows or labels currently coupled to `dd` / `dl` structure
    - export popover and shared overview surfaces currently coupled to component class names
3. Keep new hooks specific and intention-revealing so tests can target behavior rather than markup.

**Exit criteria**

- Shared components expose the minimum stable hooks needed by the tests.
- No new hook depends on a framework-specific class name or DOM shape.

### Phase 3 — Refactor shared Playwright helpers and models first

1. Update shared utilities to consume the new stable hooks or accessible selectors:
    - `tests/utils/datePicker.ts`
    - `tests/utils/utils.ts`
    - `tests/models/internal-components/dataGrid.ts`
    - `tests/models/external-components/transactionDetails.page.ts`
    - `tests/models/external-components/transactionsOverview.page.ts`
2. Remove duplicated framework-coupled selector logic from specs by centralizing replacements in helpers first.
3. Where text is localized, prefer the existing translation helper so selectors stay aligned with current i18n keys.

**Exit criteria**

- Shared helpers and page objects no longer depend on `.adyen-pe-*`, XPath, or structural selectors.
- Downstream specs can migrate with minimal repeated selector logic.

### Phase 4 — Migrate specs by domain, highest leverage first

Recommended order:

1. `transactionDetails`
2. `disputeManagement`
3. `paymentLinkCreation`
4. `paymentLinksSettings`
5. `transactionsOverview`
6. `payoutDetails`
7. Remaining integration specs with lower selector debt
8. E2E specs last, after shared helpers are stable

For each domain:

1. Replace remaining framework-coupled selectors with accessible or test-id selectors.
2. Remove fallback positional selectors where a stable target now exists.
3. Run targeted Playwright coverage for that domain before moving to the next batch.

**Exit criteria**

- Each migrated domain is free of framework-coupled selectors.
- Targeted tests pass before the next domain begins.

### Phase 5 — Add a guardrail and complete full-suite verification

1. Add a prevention mechanism for new framework-coupled selectors.
    - This still needs a final implementation choice: ESLint rule, dedicated CI/script check, or another enforceable repo guard.
    - At minimum, the guard should block new `.adyen-pe-*` and `xpath=` selectors in Playwright tests.
2. Run repo-wide checks relevant to the implementation.
3. Run the full Playwright suites to confirm behavior parity on the current build:
    - `pnpm run test:integration`
    - `pnpm run test:e2e`

**Exit criteria**

- Acceptance criteria from `IEX-2295` are met.
- The suite passes without framework-coupled selectors.
- A guard exists to prevent the same selector debt from re-entering the codebase.

## Validation strategy during implementation

- Use targeted runs after each domain batch to keep failures localized.
- Re-run shared helper consumers after refactoring shared test utilities.
- Use repo-wide searches to verify the migration is complete before final test runs.
- Finish with full integration and E2E runs only after the helper/model refactor and domain migrations are complete.

## Open decisions to confirm during implementation

- Which guardrail mechanism is preferred for the repo: ESLint rule, CI/script check, or code-review-only policy.
- Whether any existing selector currently using visible text should stay text-based or move to `data-testid` because the text is not the real behavior under test.
- Whether additional shared primitives beyond the hotspots above need stable hooks once the first migration batch is underway.
