# PayoutsOverview: v1 to v2

`onRecordSelection({ balanceAccountId, date, showModal })` becomes `onRecordSelection({ id, date, showDetails })`: **`balanceAccountId` is renamed `id`** (still the balance account, not a payout ID), `date` is unchanged (the payout date, ISO), and `showModal` becomes `showDetails` as in `references/global.md`.

Also apply `references/global.md` and `references/css-overrides.md`.

Exact types: `PayoutsOverviewProps` in the package's `.d.ts` files.
