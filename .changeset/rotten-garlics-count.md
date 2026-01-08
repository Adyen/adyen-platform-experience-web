---
'@adyen/adyen-platform-experience-web': minor
---

NEW

- You can now integrate our new Pay by Link components. These components include all the necessary features to help your users generate and manage secure payment links, allowing them to view a comprehensive list of links, track real time statuses, and monitor key details like payment IDs and expiration dates throughout the entire transaction life cycle.

- In the Transaction components, we introduced a number of enhancements to provide your users with a more comprehensive view of their financial activity. This includes an updated Transaction Details component featuring three new sections, Summary, Details, and Timeline to ensure full visibility into the life cycle of every payment. Additionally, we added a new dual-view in the Transactions Overview component that allows users to switch between:
    - Transactions: A data grid for managing account balances, viewing transaction data, and exporting a list of transactions for a balance account.
    - Insights: A visual breakdown of period totals, incomings, and expenses to help users track their performance at a glance.

- In the Capital components, analytic events are now available for critical flows. These are enabled by default, providing the flexibility to opt out as needed.

PATCH

- Across applicable components, we implemented lossless and accurate analytics data collection. This feature is enabled by default, providing the flexibility to opt out as needed.
- Across all components, we implemented consistent toggle behavior for filter dropdowns.
