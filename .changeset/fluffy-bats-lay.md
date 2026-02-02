---
'@adyen/adyen-platform-experience-web': patch
---

- In the Transactions Overview component, we added a new "Last 180 days" option to the date filter. This is now the default filter selection.
- In the Transactions Overview component, we updated the PSP reference filter to require a valid length of 16 characters.
- In the Transaction Details component, we now show currency codes instead of symbols for transaction summary amounts. This provides increased clarity, especially when viewing multi-currency split payments.
- In the Pay By Link components, we improved the mobile button experience across the overview, settings, and creation flows. We also ensured Terms and Conditions are viewed prior to agreement. Finally, we optimized form behavior to ensure searchable fields and error scrolling function correctly.
- In the Transactions Overview component, we fixed an issue to ensure transaction totals correctly reflect the applied filters for the transactions list.
- In the Pay By Link creation flow, we fixed the logic to ensure mandatory billing address validation errors trigger correctly when delivery address is marked optional.
- In the Pay by Link Overview and Settings components, an issue was resolved where users without the Manage Settings role could still see the settings UI. Although these users were previously unable to save changes, the components now correctly restrict access and hide the settings area based on the user's permissions.
