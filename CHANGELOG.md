# @adyen/adyen-platform-experience-web

## 1.3.1

### Patch Changes

-   43352e5: Fix styles import path

## 1.3.0

### Minor Changes

-   865ff93: Add isInUnsupportedRegion state to getState method of Capital component.

### Patch Changes

-   865ff93: Add an interface for the unsupported region which will be shown by default when the user's legal entity region is unsupported for the Capital component.

## 1.2.0

### Minor Changes

-   105a719: Introduction of two new components: **CapitalOverview** and **CapitalOffer**. These components will enable you to integrate all the features required to offer business financing (also called a grant) in your user interface with minimal engineering effort.

    The **Capital Overview** component enables users to:

    -   View messages indicating their eligibility to receive a grant.
    -   Sign the Terms of Service required to secure a grant from Adyen.
    -   Check the current status of their grant.
    -   Access the term sheet for detailed information about the active grant, such as the repayment threshold, repayment period, fees, the amount already repaid, and the remaining amount.
    -   Track their repayment progress.

    The **Capital Offer** component enables user to:

    -   Select a grant amount within their qualifying limit using a dynamic slider.
    -   View a preliminary term sheet of the selected grant offer, such as the repayment threshold, repayment period, and fees.
    -   Apply for a grant.

    **By default, the Capital Overview component includes the Capital Offer component, which together provide the complete flow.**

-   e962c6d: Introduction of **Refunds** feature.

    Added refunds feature to a transactions overview and transaction details components which makes user to refund the money to shopper.
    Having this feature will make the refund button appear on the transaction details and it will be possible to refund money fully or partially.
    Additionally, more information added to transaction details such as fee and original amount.

-   c0367c9: Introduction of fi-FI locale to available translations.

### Patch Changes

-   3f5367a: Add translations to type column in the transactions overview table.

## 1.1.1

### Patch Changes

-   e5bb419: Fix broken translation type declarations

## 1.1.0

### Minor Changes

-   e4dec35: **Added**

    -   **New Reports component**:
        -   Supports displaying and downloading reports.
        -   Allows filtering of reports by balance account and date ranges.

### Patch Changes

-   94fca83: Lazy loading translations for supported locales (except en-US)
-   60678c4: Remove seconds from dates in transactions table
-   4241055: Fixed amount filter validation. Apply button will be disabled if the min amount is bigger than max amount

## 1.0.3

### Patch Changes

-   -   Fixed rounding bug in amount filter
    -   Updated date picker calendar to be fully timezone-aware
    -   Added open-source license to package.json

## 1.0.2

### Patch Changes

-   e244bae: New version
