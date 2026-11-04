# DisputesOverview: v1 to v2

CSS that hid dispute tabs becomes `tabs: { hidden: [...] }`, e.g. `['FRAUD_ALERTS']`. Hiding every tab is ignored. `id` in `onRecordSelection` is the dispute PSP reference.

Also apply `references/global.md` and `references/css-overrides.md`.

Exact types: `DisputesOverviewProps` in the package's `.d.ts` files.
