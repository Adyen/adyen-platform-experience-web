# Changes for every component

## Package and stylesheet

Upgrade `@adyen/adyen-platform-experience-web` to 2.x. Keep importing `@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css` once.

If the app embeds the library with `<script>` and `<link>` tags instead of npm, update both URLs to the v2 version and replace both `integrity` attributes: the Subresource Integrity hashes for each version are in Adyen's release notes for Platform Experience components, under "Updating to this version". Don't remove the `integrity` attributes to make the upgrade work. Ask the user for the hashes if you can't find them.

## Core options (`AdyenPlatformExperience({ ... })`)

| v1                                      | v2                                                             |
| --------------------------------------- | -------------------------------------------------------------- |
| `availableTranslations: [en_US, nl_NL]` | Removed. Every supported locale loads on demand; keep `locale` |

`environment`, `locale`, `onSessionCreate`, `translations` and `onError` are unchanged.

## Props on every component

| v1                       | v2                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `hideTitle: true`        | `appearance: { titles: 'hidden' }` on the component, or on Core for all components                |
| `onError` on a component | Removed from components; move the handler to the Core `onError` option                            |
| `balanceAccountId`       | Removed; users choose the balance account in the component's filters. Delete it and tell the user |

## Overview components (Disputes, Payment links, Payouts, Reports, Transactions)

| v1                                     | v2                                                                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preferredLimit`                       | `pagination: { defaultLimit }`, one of 10, 20, 30, 40, 50. Round an unsupported v1 value (e.g. 15) to the nearest option and tell the user                                                                           |
| `allowLimitSelection: false`           | `pagination: { disableLimitSelection: true }` (inverted)                                                                                                                                                             |
| `onRecordSelection({ id, showModal })` | `onRecordSelection({ id, showDetails })`. **Passing it turns off the built-in details unless it calls `showDetails()`**: call it wherever v1 called `showModal()`, or where v1 relied on the default details opening |
| `showDetails: false`                   | Removed. To keep details closed, pass `onRecordSelection` and don't call `showDetails()`                                                                                                                             |
| `onFiltersChanged`                     | Removed, no replacement. Delete it and tell the user which callback was dropped and what it did                                                                                                                      |

## Data customization

| v1                                           | v2                                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataCustomization.list`                     | `dataCustomization.dataGrid`, same `fields` and `onDataRetrieve`. **A leftover `list` is silently ignored**, so rename every one                                 |
| `fields: [{ key, align, flex, visibility }]` | `align` removed; alignment is automatic. A leftover `align` is silently ignored in JavaScript, so delete every one. `key`, `flex` and `visibility` are unchanged |
| `dataCustomization.details`                  | Unchanged                                                                                                                                                        |

## Custom translations

All `common.*` keys are now scoped to their domain. Re-key every custom translation that starts with `common.`, e.g. `common.actions.copy.labels.done` becomes `transactions.common.actions.copy.labels.done`. Use the domain of the component whose text the override changes (`capital`, `disputes`, `payByLink`, `payouts`, `reports`, `transactions`); if the same key served several components, add one per domain. Check the new keys against the `TranslationKey` type.

## Styling

See `references/css-overrides.md`.
