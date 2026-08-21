# Capital business flows

This guide explains the business behavior in every Capital flow (represented by mocked Storybook stories) and names the domain util function responsible for that behavior.

Notes

- A **domain util function** is a reusable business rule in [`domain/src/utils`](../domain/src/utils).
- A scenario may be caused by a Preact-only behavior. In that case, the guide explicitly states that no matching domain function exists.

## Capital Offer flows

Storybook folder: `Mocked/Capital/Capital Offer`

### Unsupported region

**Story:** [`UnsupportedRegion`]

**Business behavior:** An user outside the configured supported regions sees the unavailable-region state. The public `getState()` classification also prevents the Storybook decorator from mounting the component by default.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) determines whether the legal-entity region is supported.
- [getExternalCapitalState](../domain/src/utils/externalState.ts) converts that result to `isInUnsupportedRegion` for the public component API.
- [getSupportedRegions](../domain/src/utils/regions.ts) loads the supported-region configuration with a bundled fallback.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [externalState.test.ts](../domain/src/utils/externalState.test.ts), [regions.test.ts](../domain/src/utils/regions.test.ts).

### Ineligible

**Story:** [`Ineligible`](../preact/stories/CapitalOffer/mocked.stories.tsx#L49)

**Business behavior:** An user without a dynamic offer sees the no-offer state. `getState()` classifies the user as unqualified and the Storybook decorator can skip mounting it.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) reflects the missing offer the enhanced state.
- [getExternalCapitalState](../domain/src/utils/externalState.ts) returns `isUnqualified` state.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [externalState.test.ts](../domain/src/utils/externalState.test.ts).

### Eligible

**Story:** [`Eligible`](../preact/stories/CapitalOffer/mocked.stories.tsx#L87)

**Business behavior:** An eligible user can select an amount and repayment term, review the resulting offer, and request funds.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) accepts the eligible dynamic offer.
- [getDynamicOfferConfig](../domain/src/utils/offer/dynamicOfferConfig.ts), [getCurrency](../domain/src/utils/offer/dynamicOfferConfig.ts), [getDefaultAmountValue](../domain/src/utils/offer/dynamicOfferConfig.ts), and [getEstimatedTerms](../domain/src/utils/offer/dynamicOfferConfig.ts) prepare the selectable offer configuration.
- [getOffersByTerm](../domain/src/utils/offer/offers.ts), [getAvailableTerms](../domain/src/utils/offer/offers.ts), [getDefaultTerm](../domain/src/utils/offer/offers.ts), [adjustSelectedTerm](../domain/src/utils/offer/offers.ts), and [getOfferForTerm](../domain/src/utils/offer/offers.ts) choose a valid offer for the selected term.
- [getCreateGrantOfferBody](../domain/src/utils/offer/offers.ts) builds the review request body.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts).

### Eligible CA

**Story:** [`EligibleCA`](../preact/stories/CapitalOffer/mocked.stories.tsx#L99)

**Business behavior:** The standard offer flow uses Canadian currency and displays Canadian legal information and APR.

**Domain functions:**

- The offer-selection functions listed for [Eligible](#eligible) determine the amount, terms, and reviewed offer.
- [calculatePercentageFromBasisPoints](../domain/src/utils/generic.ts) converts the APR basis points into the displayed percentage.

**No matching domain function:** The regional legal wording and subtitle are Preact presentation behavior.

**Tests:** [generic.test.ts](../domain/src/utils/generic.test.ts), [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts).

### Eligible US

**Story:** [`EligibleUS`](../preact/stories/CapitalOffer/mocked.stories.tsx#L111)

**Business behavior:** The standard offer flow displays US regional and creditor disclosures.

**Domain functions:**

- The offer-selection functions listed for [Eligible](#eligible) determine the amount, terms, and reviewed offer.

**No matching domain function:** The US legal wording and regional subtitle are Preact presentation behavior.

**Tests:** [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts).

### Eligible with ongoing grants

**Story:** [`EligibleWithOngoingGrants`](../preact/stories/CapitalOffer/mocked.stories.tsx#L123)

**Business behavior:** An active grant that is not renewable prevents a second offer from being shown.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) considers active and pending grants, determines renewal eligibility, and removes the dynamic offer when ongoing grants cannot be renewed.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts).

### Early renewal

**Story:** [`EarlyRenewal`](../preact/stories/CapitalOffer/mocked.stories.tsx#L135)

**Business behavior:** An user with an eligible renewable grant receives an offer with a potentially higher minimum amount, sees the renewal amount breakdown, and can compare new and current terms.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) identifies renewable grants and keeps the offer valid only when renewal is possible.
- [getIsEarlyRenewal](../domain/src/utils/state.ts) identifies the early-renewal flow.
- [getDynamicOfferConfig](../domain/src/utils/offer/dynamicOfferConfig.ts) raises the minimum selectable amount when the renewable grant requires it.
- [getSimplifiedRenewableGrant](../domain/src/utils/state.ts) provides the existing-grant fields used for comparison.
- [getRenewalAmountBreakdown](../domain/src/utils/offer/renewal.ts) calculates the new-loan, current-balance, and net-receivable amounts.
- [getCreateGrantOfferBody](../domain/src/utils/offer/offers.ts) builds the request for the review operation.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [renewal.test.ts](../domain/src/utils/offer/renewal.test.ts).

### Error, offer configuration

**Story:** [`ErrorOfferConfig`](../preact/stories/CapitalOffer/mocked.stories.tsx#L147)

**Business behavior:** A Capital-state error with code `30_016` is presented as the unavailable-offers error with the request ID and support behavior.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) maps a recognized Capital error code and request ID to the correct error-message configuration.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, account holder

**Story:** [`ErrorAccountHolder`](../preact/stories/CapitalOffer/mocked.stories.tsx#L159)

**Business behavior:** A Capital-state error with code `30_011` is presented as the inactive-account error.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) maps the account-holder error code to the correct message and support configuration.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, offer

**Story:** [`ErrorOffer`](../preact/stories/CapitalOffer/mocked.stories.tsx#L171)

**Business behavior:** The dynamic-offer endpoint continues failing after retries, so offer selection shows a generic recoverable error.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) provides the generic error-message configuration for an unrecognized error.

**No matching domain function:** Retry count, retry timing, and the final selection-screen error state are Preact behavior.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, temporary offer

**Story:** [`ErrorTemporaryOffer`](../preact/stories/CapitalOffer/mocked.stories.tsx#L183)

**Business behavior:** The first dynamic-offer request fails, a retry succeeds, and the normal offer-selection flow becomes available.

**No matching domain function:** Retry recovery is Preact behavior. The successful state subsequently uses the [Eligible](#eligible) offer-selection functions.

**Tests:** [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts).

### Error, review

**Story:** [`ErrorReview`](../preact/stories/CapitalOffer/mocked.stories.tsx#L195)

**Business behavior:** Creating the reviewed offer fails, so the user remains on selection and receives a recoverable error.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) provides the generic error-message configuration.

**No matching domain function:** Mutation failure handling and keeping the user on the selection screen are Preact behavior.

**Tests:** [offers.test.ts](../domain/src/utils/offer/offers.test.ts), [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, submit

**Story:** [`ErrorSubmit`](../preact/stories/CapitalOffer/mocked.stories.tsx#L207)

**Business behavior:** Requesting funds fails from the review screen and displays a recoverable error that allows returning to selection.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) provides the generic error-message configuration.

**No matching domain function:** Submission failure handling and return navigation are Preact behavior.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error with code, submit

**Story:** [`ErrorWithCodeSubmit`](../preact/stories/CapitalOffer/mocked.stories.tsx#L219)

**Business behavior:** Requesting funds fails with code `30_600`, which displays the Capital-specific cannot-continue message with its request ID.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) maps `30_600` to the Capital-specific error configuration.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, balance account

**Story:** [`ErrorBalanceAccount`](../preact/stories/CapitalOffer/mocked.stories.tsx#L231)

**Business behavior:** A `30_013` request-funds error keeps the review visible and shows a missing-primary-balance-account warning instead of the generic error page.

**No matching domain function:** The special `30_013` handling is Preact behavior.

**Tests:** No domain utility test exists for this special-case behavior.

## Capital Overview flows

Storybook folder: `Mocked/Capital/Capital Offer`

### Unsupported region

**Story:** [`UnsupportedRegion`](../preact/stories/CapitalOverview/mocked.stories.tsx#L14)

**Business behavior:** An user outside supported regions sees the Overview unavailable-region state and public `getState()` returns `isInUnsupportedRegion`.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) evaluates regional support.
- [getExternalCapitalState](../domain/src/utils/externalState.ts) exposes the public unsupported-region classification.
- [getSupportedRegions](../domain/src/utils/regions.ts) supplies the configured regions with a fallback.
- [shouldGetGrants](../domain/src/utils/state.ts) prevents grant retrieval for an unsupported region.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [externalState.test.ts](../domain/src/utils/externalState.test.ts), [regions.test.ts](../domain/src/utils/regions.test.ts).

### Ineligible

**Story:** [`Ineligible`](../preact/stories/CapitalOverview/mocked.stories.tsx#L51)

**Business behavior:** An user with neither a valid offer nor grants reaches the pre-qualified area, where the embedded Offer displays the no-offer state.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) removes an absent or invalid offer.
- [getExternalCapitalState](../domain/src/utils/externalState.ts) returns `isUnqualified` for the public element API.
- [shouldGetGrants](../domain/src/utils/state.ts) determines whether the Overview should request grant details.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [externalState.test.ts](../domain/src/utils/externalState.test.ts).

### First-time eligible

**Story:** [`FirstTimeEligible`](../preact/stories/CapitalOverview/mocked.stories.tsx#L88)

**Business behavior:** A first-time eligible user sees the pre-qualified introduction, enters the embedded Offer flow, and sees the newly requested pending grant after successful submission.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) recognizes a valid first offer without grants.
- The Offer functions listed for [Eligible](#eligible) choose and create the offer.
- [getAdjustedGrants](../domain/src/utils/overview/grants.ts) prepends the newly requested grant to the current grant list.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts), [grants.test.ts](../domain/src/utils/overview/grants.test.ts).

### Early renewal

**Story:** [`EarlyRenewal`](../preact/stories/CapitalOverview/mocked.stories.tsx#L100)

**Business behavior:** A renewable active grant presents a renewal option. Completing it creates a pending replacement grant and removes the renewed active grant from the displayed list.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) identifies the renewable grant and keeps the renewal offer available.
- [shouldGetGrants](../domain/src/utils/state.ts) permits grant retrieval for the supported state with grants.
- [getIsEarlyRenewal](../domain/src/utils/state.ts) identifies the early-renewal path.
- [getAdjustedGrants](../domain/src/utils/overview/grants.ts) inserts the requested replacement grant and removes renewed active grants.
- [getGroupedGrants](../domain/src/utils/overview/grants.ts) groups the resulting grants for display.
- [getGrantConfig](../domain/src/utils/overview/grant.ts) supplies the rendered grant state.
- [getRenewalAmountBreakdown](../domain/src/utils/offer/renewal.ts) calculates the renewal values in the embedded Offer.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [grants.test.ts](../domain/src/utils/overview/grants.test.ts), [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [renewal.test.ts](../domain/src/utils/offer/renewal.test.ts).

### Eligible

**Story:** [`Eligible`](../preact/stories/CapitalOverview/mocked.stories.tsx#L110)

**Business behavior:** An user with a closed grant can start a new Offer flow and sees the newly requested pending grant after submitting.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) treats closed-grant history as grants while allowing a valid new offer.
- [shouldGetGrants](../domain/src/utils/state.ts) permits grant retrieval.
- [getAdjustedGrants](../domain/src/utils/overview/grants.ts) inserts the newly requested grant.
- [getGroupedGrants](../domain/src/utils/overview/grants.ts) separates the new pending grant and closed history into display groups.
- [getGrantConfig](../domain/src/utils/overview/grant.ts) supplies each grant's rendered state.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [grants.test.ts](../domain/src/utils/overview/grants.test.ts), [grant.test.ts](../domain/src/utils/overview/grant.test.ts).

### Grants

**Story:** [`Grants`](../preact/stories/CapitalOverview/mocked.stories.tsx#L120)

**Business behavior:** Grants are split into ongoing and closed groups. Active grants expose details, while other statuses have their own labels, actions, and tooltips.

**Domain functions:**

- [getAdjustedGrants](../domain/src/utils/overview/grants.ts) removes grants already renewed by a newly requested replacement.
- [getGroupedGrants](../domain/src/utils/overview/grants.ts) groups ongoing and closed grants while preserving order.
- [getHasGrantGroups](../domain/src/utils/overview/grants.ts) determines whether both groups exist.
- [getGrantConfig](../domain/src/utils/overview/grant.ts) maps each grant status to its presentation configuration.
- [getEnhancedGrant](../domain/src/utils/overview/grant.ts) converts maximum repayment days to months.
- [calculatePercentageFromBasisPoints](../domain/src/utils/generic.ts) converts repayment rates for display.

**Tests:** [grants.test.ts](../domain/src/utils/overview/grants.test.ts), [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [generic.test.ts](../domain/src/utils/generic.test.ts).

### Pending

**Story:** [`Pending`](../preact/stories/CapitalOverview/mocked.stories.tsx#L130)

**Business behavior:** A pending grant shows its requested amount and processing state rather than active-grant progress and details.

**Domain functions:**

- [getEnhancedCapitalState](../domain/src/utils/state.ts) includes pending grants in the Overview state.
- [shouldGetGrants](../domain/src/utils/state.ts) permits retrieving their details.
- [getAdjustedGrants](../domain/src/utils/overview/grants.ts) returns the received grant list when no local request changes it.
- [getGrantConfig](../domain/src/utils/overview/grant.ts) maps the pending grant to its processing configuration.

**Tests:** [state.test.ts](../domain/src/utils/state.test.ts), [grants.test.ts](../domain/src/utils/overview/grants.test.ts), [grant.test.ts](../domain/src/utils/overview/grant.test.ts).

### Multiple actions

**Story:** [`MultipleActions`](../preact/stories/CapitalOverview/mocked.stories.tsx#L140)

**Business behavior:** A pending grant progresses from a single action to multiple embedded actions. The first incomplete action is primary, completed actions change state, and polling stops after multiple actions are known.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) identifies the pending grant as requiring actions.
- [getMissingActions](../domain/src/utils/overview/missingActions.ts) retrieves the latest actions for the grant from the grants response.
- [getMissingActionsMetadata](../domain/src/utils/overview/missingActions.ts) identifies the primary and completed actions.
- [shouldPollMissingActions](../domain/src/utils/overview/missingActions.ts) allows polling only while zero or one action is present.
- [getNextPollingInterval](../domain/src/utils/overview/missingActions.ts) applies polling backoff and stopping rules.
- [getPollingConfig](../domain/src/utils/overview/polling.ts) loads the polling settings with a fallback.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts), [polling.test.ts](../domain/src/utils/overview/polling.test.ts).

### Single action

**Story:** [`SingleAction`](../preact/stories/CapitalOverview/mocked.stories.tsx#L150)

**Business behavior:** A pending grant with one action exposes a single primary embedded terms-and-conditions action.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) identifies the grant as requiring actions.
- [getMissingActionsMetadata](../domain/src/utils/overview/missingActions.ts) marks the first incomplete action as primary.
- [shouldPollMissingActions](../domain/src/utils/overview/missingActions.ts) allows polling while only one action remains.
- [getNextPollingInterval](../domain/src/utils/overview/missingActions.ts) computes the next polling delay.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts).

### Multiple hosted actions

**Story:** [`MultipleHostedActions`](../preact/stories/CapitalOverview/mocked.stories.tsx#L160)

**Business behavior:** A pending grant has multiple actions that open hosted completion flows.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) identifies the grant as requiring actions.
- [getMissingActions](../domain/src/utils/overview/missingActions.ts), [shouldPollMissingActions](../domain/src/utils/overview/missingActions.ts), and [getNextPollingInterval](../domain/src/utils/overview/missingActions.ts) govern action retrieval and polling.

**No matching domain function:** Choosing hosted mode from an empty onboarding configuration and redirecting to hosted action URLs are Preact behavior. The hosted configuration and URLs are mock-controlled.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts).

### Single hosted action

**Story:** [`SingleHostedAction`](../preact/stories/CapitalOverview/mocked.stories.tsx#L170)

**Business behavior:** A pending grant has one hosted terms-and-conditions action.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) identifies the grant as requiring actions.
- [getMissingActionsMetadata](../domain/src/utils/overview/missingActions.ts) identifies the primary action.
- [shouldPollMissingActions](../domain/src/utils/overview/missingActions.ts) and [getNextPollingInterval](../domain/src/utils/overview/missingActions.ts) govern polling.

**No matching domain function:** Hosted-mode selection and the redirect itself are Preact behavior. The empty onboarding configuration and destination URL are mock-controlled.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts).

### Repayment NL

**Story:** [`RepaymentNL`](../preact/stories/CapitalOverview/mocked.stories.tsx#L180)

**Business behavior:** An active grant exposes a Netherlands repayment account with IBAN and verified-account details.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) makes repayment details available for an active grant with a repayment account.
- [getBankAccount](../domain/src/utils/overview/repayments.ts) selects the repayment account.
- [getTransferInstrumentIds](../domain/src/utils/overview/repayments.ts) returns verified account identifiers.
- [getBankAccountFields](../domain/src/utils/overview/repayments.ts), [isBankAccountFieldPrimary](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldFormattedValue](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldTextToCopy](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldCopyButtonTranslationKey](../domain/src/utils/overview/repayments.ts), and [getBankAccountFieldTranslationKey](../domain/src/utils/overview/repayments.ts) select, format, label, and make fields copyable.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [repayments.test.ts](../domain/src/utils/overview/repayments.test.ts).

### Repayment GB

**Story:** [`RepaymentGB`](../preact/stories/CapitalOverview/mocked.stories.tsx#L190)

**Business behavior:** An active grant exposes a Great Britain repayment account with IBAN, account-number, and sort-code details.

**Domain functions:**

- The repayment functions listed for [Repayment NL](#repayment-nl) select, order, format, label, and expose the GB repayment fields.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [repayments.test.ts](../domain/src/utils/overview/repayments.test.ts).

### Repayment US

**Story:** [`RepaymentUS`](../preact/stories/CapitalOverview/mocked.stories.tsx#L200)

**Business behavior:** An active grant exposes a US repayment account with account-number and routing-number details.

**Domain functions:**

- The repayment functions listed for [Repayment NL](#repayment-nl) select, order, format, label, and expose the US repayment fields.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [repayments.test.ts](../domain/src/utils/overview/repayments.test.ts).

### Repayment without transfer instruments

**Story:** [`RepaymentWithoutTransferInstruments`](../preact/stories/CapitalOverview/mocked.stories.tsx#L210)

**Business behavior:** A repayment account is available, but the verified-bank-account section is absent because there are no transfer instruments.

**Domain functions:**

- [getBankAccount](../domain/src/utils/overview/repayments.ts) still selects the repayment account.
- [getTransferInstrumentIds](../domain/src/utils/overview/repayments.ts) returns an empty list when transfer instruments are absent.
- The remaining repayment functions listed for [Repayment NL](#repayment-nl) format the available account fields.

**Tests:** [repayments.test.ts](../domain/src/utils/overview/repayments.test.ts).

### Error, offer configuration

**Story:** [`ErrorOfferConfig`](../preact/stories/CapitalOverview/mocked.stories.tsx#L220)

**Business behavior:** A Capital-state error with code `30_016` displays the unavailable-offers error and request ID.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) maps the recognized error code to the Capital-specific error configuration.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, account holder

**Story:** [`ErrorAccountHolder`](../preact/stories/CapitalOverview/mocked.stories.tsx#L232)

**Business behavior:** A Capital-state error with code `30_011` displays the inactive-account error and request ID.

**Domain functions:**

- [getCapitalErrorMessage](../domain/src/utils/errors.ts) maps the recognized account-holder error code to its error configuration.

**Tests:** [errors.test.ts](../domain/src/utils/errors.test.ts).

### Error, onboarding configuration

**Story:** [`ErrorOnboardingConfig`](../preact/stories/CapitalOverview/mocked.stories.tsx#L244)

**Business behavior:** An onboarding-configuration error falls back to hosted-action buttons instead of rendering a page-level error.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) determines that the pending grant requires actions.
- [getMissingActions](../domain/src/utils/overview/missingActions.ts) and [getMissingActionsMetadata](../domain/src/utils/overview/missingActions.ts) provide the displayed actions and their state.

**No matching domain function:** The fallback from a failed onboarding configuration to hosted actions is Preact behavior. The failure and hosted action details are mock-controlled.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts), [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts).

### Error, hosted action

**Story:** [`ErrorHostedAction`](../preact/stories/CapitalOverview/mocked.stories.tsx#L256)

**Business behavior:** Starting a hosted terms-and-conditions action fails and replaces the action alert with a refreshable critical error.

**Domain functions:**

- [getGrantConfig](../domain/src/utils/overview/grant.ts) determines that the pending grant requires actions.

**No matching domain function:** The action-endpoint error and refreshable critical alert are Preact behavior. The failed hosted-action endpoint is mock-controlled.

**Tests:** [grant.test.ts](../domain/src/utils/overview/grant.test.ts).

## Domain function index

| Business area                     | Functions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Tests                                                                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State, region, and public state   | [getEnhancedCapitalState](../domain/src/utils/state.ts), [shouldGetGrants](../domain/src/utils/state.ts), [getIsEarlyRenewal](../domain/src/utils/state.ts), [getSimplifiedRenewableGrant](../domain/src/utils/state.ts), [getExternalCapitalState](../domain/src/utils/externalState.ts), [getSupportedRegions](../domain/src/utils/regions.ts)                                                                                                                                                                                                                                                                                                     | [state.test.ts](../domain/src/utils/state.test.ts), [externalState.test.ts](../domain/src/utils/externalState.test.ts), [regions.test.ts](../domain/src/utils/regions.test.ts)     |
| Offer configuration and selection | [getDynamicOfferConfig](../domain/src/utils/offer/dynamicOfferConfig.ts), [getCurrency](../domain/src/utils/offer/dynamicOfferConfig.ts), [getDefaultAmountValue](../domain/src/utils/offer/dynamicOfferConfig.ts), [getEstimatedTerms](../domain/src/utils/offer/dynamicOfferConfig.ts), [getOffersByTerm](../domain/src/utils/offer/offers.ts), [getAvailableTerms](../domain/src/utils/offer/offers.ts), [getDefaultTerm](../domain/src/utils/offer/offers.ts), [adjustSelectedTerm](../domain/src/utils/offer/offers.ts), [getOfferForTerm](../domain/src/utils/offer/offers.ts), [getCreateGrantOfferBody](../domain/src/utils/offer/offers.ts) | [dynamicOfferConfig.test.ts](../domain/src/utils/offer/dynamicOfferConfig.test.ts), [offers.test.ts](../domain/src/utils/offer/offers.test.ts)                                     |
| Offer and renewal calculations    | [getRenewalAmountBreakdown](../domain/src/utils/offer/renewal.ts), [calculateMonthsFromDays](../domain/src/utils/offer/generic.ts), [calculateMonthsAndDaysFromDays](../domain/src/utils/offer/generic.ts), [calculateTimestampAfterDays](../domain/src/utils/offer/generic.ts), [getRelativeToDefault](../domain/src/utils/offer/generic.ts), [getPercentageOfRange](../domain/src/utils/offer/generic.ts), [calculatePercentageFromBasisPoints](../domain/src/utils/generic.ts)                                                                                                                                                                    | [renewal.test.ts](../domain/src/utils/offer/renewal.test.ts), [generic.test.ts](../domain/src/utils/offer/generic.test.ts), [generic.test.ts](../domain/src/utils/generic.test.ts) |
| Grant lists and status            | [getAdjustedGrants](../domain/src/utils/overview/grants.ts), [getGroupedGrants](../domain/src/utils/overview/grants.ts), [getHasGrantGroups](../domain/src/utils/overview/grants.ts), [getGrantConfig](../domain/src/utils/overview/grant.ts), [getEnhancedGrant](../domain/src/utils/overview/grant.ts)                                                                                                                                                                                                                                                                                                                                             | [grants.test.ts](../domain/src/utils/overview/grants.test.ts), [grant.test.ts](../domain/src/utils/overview/grant.test.ts)                                                         |
| Missing actions and polling       | [getMissingActions](../domain/src/utils/overview/missingActions.ts), [getMissingActionsMetadata](../domain/src/utils/overview/missingActions.ts), [shouldPollMissingActions](../domain/src/utils/overview/missingActions.ts), [getNextPollingInterval](../domain/src/utils/overview/missingActions.ts), [getPollingConfig](../domain/src/utils/overview/polling.ts)                                                                                                                                                                                                                                                                                  | [missingActions.test.ts](../domain/src/utils/overview/missingActions.test.ts), [polling.test.ts](../domain/src/utils/overview/polling.test.ts)                                     |
| Repayments                        | [getBankAccount](../domain/src/utils/overview/repayments.ts), [getTransferInstrumentIds](../domain/src/utils/overview/repayments.ts), [getBankAccountFields](../domain/src/utils/overview/repayments.ts), [isBankAccountFieldPrimary](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldFormattedValue](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldTextToCopy](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldCopyButtonTranslationKey](../domain/src/utils/overview/repayments.ts), [getBankAccountFieldTranslationKey](../domain/src/utils/overview/repayments.ts)                          | [repayments.test.ts](../domain/src/utils/overview/repayments.test.ts)                                                                                                              |
| Errors                            | [getCapitalErrorMessage](../domain/src/utils/errors.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [errors.test.ts](../domain/src/utils/errors.test.ts)                                                                                                                               |
