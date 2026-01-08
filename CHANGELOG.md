# @adyen/adyen-platform-experience-web

## 1.10.0

### Minor Changes

- e860579: NEW
    - You can now integrate our new Pay by Link components. These components include all the necessary features to help your users generate and manage secure payment links, allowing them to view a comprehensive list of links, track real time statuses, and monitor key details like payment IDs and expiration dates throughout the entire transaction life cycle.
    - In the Transaction components, we introduced a number of enhancements to provide your users with a more comprehensive view of their financial activity. This includes an updated Transaction Details component featuring three new sections, Summary, Details, and Timeline to ensure full visibility into the life cycle of every payment. Additionally, we added a new dual-view in the Transactions Overview component that allows users to switch between:
        - Transactions: A data grid for managing account balances, viewing transaction data, and exporting a list of transactions for a balance account.
        - Insights: A visual breakdown of period totals, incomings, and expenses to help users track their performance at a glance.
    - In the Capital components, analytic events are now available for critical flows. These are enabled by default, providing the flexibility to opt out as needed.

    PATCH
    - Across applicable components, we implemented lossless and accurate analytics data collection. This feature is enabled by default, providing the flexibility to opt out as needed.
    - Across all components, we implemented consistent toggle behavior for filter dropdowns.

## 1.9.0

### Minor Changes

- In the Disputes Management component, we expanded the “Defend” option, to simplify handling RFIs and chargebacks. In addition to Mastercard and Visa, you can now defend disputes from additional payment methods, including Discover, American Express, Pulse, and Klarna. As a result, we now support 100% of defendable disputes affiliated with all these supported payment methods.
- Across all components, we updated error message styling so text that can be copied no longer appears as a clickable link.

### Patch Changes

- In the Transactions Overview component, Firefox number fields now accept numeric digits only.

## 1.8.1

### Patch Changes

- c2558b3: Resolved a bug in the package build process that prevented successful integration of the library in consuming applications.

## 1.8.0

### Minor Changes

- 81a6885: - In the Disputes Overview component, we added a tooltip to help users easily identify disputes expiring in less than 10 days.
    - In the Transaction components, we introduced internal analytics tracking to help us understand user interactions and improve future releases.
    - We now fetch static assets such as images and translations from a CDN (Content Delivery Network), which improves the loading speed and overall performance across all components.

### Patch Changes

- 007ebd0: Fix validation error in the amount filter to avoid submitting negative numbers
- 261c0a6: Fix undefended tag style in DisputesManagement component when the dispute is undefendable
- 292d4f1: Update copies for back buttons. From 'Back' to 'Go back'
- c20516a: Add missing tooltip on disputes expiring in less than 10 days

## 1.7.1

### Patch Changes

- 70f7b00: In the Capital Overview component, we have added translations for the new step to submit extra details for grants exceeding €25,000. These are now available in 10 languages

## 1.7.0

### Minor Changes

- 11b962b: In the Capital Overview components, we have updated the grant limit and streamlined the application process for a smoother experience. The grant limit was increased from €25,000 to €50,000. For grants exceeding €25,000, a new required step was added to the application flow, making it easier to submit necessary details.

### Patch Changes

- 66dde05: We fixed an issue with the balance account selector where balance account description and ID were both rendered on the same line for sufficiently wide dropdown menu container.

## 1.6.1

### Patch Changes

- 871f663: We implemented accessibility enhancements for the tooltip component.

## 1.6.0

### New

- ec93b6c: You can now integrate our new [dispute components](https://docs.adyen.com/platforms/build-user-dashboards/?component=Dispute&integration=components). These components include all the necessary features to help your users manage disputes more efficiently, allowing them to review disputes, accept chargebacks, or defend them by submitting defense documents.

### Fixed

- ec9bfc9: We resolved an issue in the Payouts, Reports, and Transactions Overview components area where the `allowLimitSelection` property wasn't explicitly set. Now, the selector is visible as expected.

## 1.5.1

### Patch Changes

- e88a51e: We corrected the text for the APR field's tooltip.

## 1.5.0

### New

- Business financing through capital components is now available to users in Canada.

### Fixed

- We corrected several Finnish translations that were inaccurate.

## 1.4.2

### Fixed

- We fixed an issue in the Capital Overview component area where the expandable card displayed content from both the expanded and collapsed states at the same time.

## 1.4.1

### Fixed

- Replaced unsupported regex lookbehind patterns causing app to crash for older browsers.

## 1.4.0

### New

- In the Capital Overview component, you can now view bank account details needed to send [unscheduled repayments](https://docs.adyen.com/platforms/capital/capital-components/#capital-overview-component), such as early repayments or to catch up if behind schedule.
- You can now add custom data in your [transaction](https://docs.adyen.com/platforms/build-user-dashboards/transaction-components/), [payout](https://docs.adyen.com/platforms/build-user-dashboards/payout-components/), and [report](https://docs.adyen.com/platforms/build-user-dashboards/reports-component/) components, such as your own fields, icons, links, and buttons. Additionally, you have control over the field settings, including their names and visibility.

### Improved

- In the Capital Offer component, the Request Funds button is now disabled after a successful funds request.
- We improved responsiveness of the components by swapping all media queries with container queries.

### Fixed

- We fixed the issue where the balance account selector in the Payouts, Reports, and Transactions Overview components failed to load if no balance account descriptions were provided.

## 1.3.1

### Patch Changes

- 43352e5: Fix styles import path

## 1.3.0

### Minor Changes

- 865ff93: Add isInUnsupportedRegion state to getState method of Capital component.

### Patch Changes

- 865ff93: Add an interface for the unsupported region which will be shown by default when the user's legal entity region is unsupported for the Capital component.

## 1.2.0

### Minor Changes

- 105a719: Introduction of two new components: **CapitalOverview** and **CapitalOffer**. These components will enable you to integrate all the features required to offer business financing (also called a grant) in your user interface with minimal engineering effort.

    The **Capital Overview** component enables users to:
    - View messages indicating their eligibility to receive a grant.
    - Sign the Terms of Service required to secure a grant from Adyen.
    - Check the current status of their grant.
    - Access the term sheet for detailed information about the active grant, such as the repayment threshold, repayment period, fees, the amount already repaid, and the remaining amount.
    - Track their repayment progress.

    The **Capital Offer** component enables user to:
    - Select a grant amount within their qualifying limit using a dynamic slider.
    - View a preliminary term sheet of the selected grant offer, such as the repayment threshold, repayment period, and fees.
    - Apply for a grant.

    **By default, the Capital Overview component includes the Capital Offer component, which together provide the complete flow.**

- e962c6d: Introduction of **Refunds** feature.

    Added refunds feature to a transactions overview and transaction details components which makes user to refund the money to shopper.
    Having this feature will make the refund button appear on the transaction details and it will be possible to refund money fully or partially.
    Additionally, more information added to transaction details such as fee and original amount.

- c0367c9: Introduction of fi-FI locale to available translations.

### Patch Changes

- 3f5367a: Add translations to type column in the transactions overview table.

## 1.1.1

### Patch Changes

- e5bb419: Fix broken translation type declarations

## 1.1.0

### Minor Changes

- e4dec35: **Added**
    - **New Reports component**:
        - Supports displaying and downloading reports.
        - Allows filtering of reports by balance account and date ranges.

### Patch Changes

- 94fca83: Lazy loading translations for supported locales (except en-US)
- 60678c4: Remove seconds from dates in transactions table
- 4241055: Fixed amount filter validation. Apply button will be disabled if the min amount is bigger than max amount

## 1.0.3

### Patch Changes

-   - Fixed rounding bug in amount filter
    - Updated date picker calendar to be fully timezone-aware
    - Added open-source license to package.json

## 1.0.2

### Patch Changes

- e244bae: New version
