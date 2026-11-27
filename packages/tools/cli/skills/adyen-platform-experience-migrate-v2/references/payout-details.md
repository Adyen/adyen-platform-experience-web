# PayoutDetails: v1 to v2

Accepts an optional `currencyCode` prop to select the payout currency in the detail API request. When mounting details from `PayoutsOverview.onRecordSelection`, pass its `currencyCode` together with `id` and `date`. The overview's built-in details modal passes the selected entry's currency automatically.

Also apply `references/global.md` (shared props, pagination, `onRecordSelection`, `dataCustomization`) and `references/css-overrides.md`.

Exact types: `PayoutDetailsProps` in the package's `.d.ts` files.
