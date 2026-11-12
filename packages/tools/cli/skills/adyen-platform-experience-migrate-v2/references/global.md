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

| v1                                     | v2                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preferredLimit`                       | `pagination: { defaultLimit }`, one of 10, 20, 30, 40, 50 (Disputes Overview: 10 or 20). Round an unsupported v1 value (e.g. 15) to the nearest option and tell the user                                                                                                                                                                              |
| `allowLimitSelection: false`           | `pagination: { disableLimitSelection: true }` (inverted)                                                                                                                                                                                                                                                                                              |
| `onRecordSelection({ id, showModal })` | `onRecordSelection({ id, showDetails })`. **Passing it turns off the built-in details unless it calls `showDetails()`**: call it wherever v1 called `showModal()`, or where v1 relied on the default details opening. Payouts Overview renames `balanceAccountId` to `id` (see its reference file); Reports Overview has no `onRecordSelection` in v2 |
| `showDetails: false`                   | Removed. To keep details closed, pass `onRecordSelection` and don't call `showDetails()`                                                                                                                                                                                                                                                              |
| `onFiltersChanged`                     | Removed, no replacement. Delete it and tell the user which callback was dropped and what it did                                                                                                                                                                                                                                                       |

## Data customization

| v1                                           | v2                                                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataCustomization.list`                     | `dataCustomization.dataGrid`, same `fields` and `onDataRetrieve`. **A leftover `list` is silently ignored**, so rename every one                                 |
| `fields: [{ key, align, flex, visibility }]` | `align` removed; alignment is automatic. A leftover `align` is silently ignored in JavaScript, so delete every one. `key`, `flex` and `visibility` are unchanged |
| `dataCustomization.details`                  | Unchanged                                                                                                                                                        |

## Custom translations

Most translation keys were renamed in v2, and a custom translation on an old key is silently ignored. Don't guess new keys from their names or text: look each one up in `references/translation-keys.tsv` (columns: v1 key, domain, v2 key). The file is large, so search it instead of reading it, matching the first column exactly, e.g. `npx @adyen/adyen-platform-experience-web skills show migrate-v2 translation-keys.tsv | grep -F 'common.actions.copy.labels.done'` (or open the installed copy).

For each key in the app's `translations`, in every locale:

- **Rows with v2 keys:** replace the key with the v2 key of each component that uses the text. A v1 `common.*` key has one row per domain (`capital`, `disputes`, `payByLink`, `payouts`, `reports`, `transactions`); add the rows for the components the app mounts, and skip the others. For example, `common.actions.copy.labels.done` becomes `transactions.common.copy.done` in an app that only shows Transactions Overview.
- **`(no match)`:** v2 has no key for this text. Delete it and report which text the customization no longer changes.
- **Not in the file:** the key is unchanged in v2, or it's the app's own key, e.g. a label for a custom column. Leave it as it is. A custom-column label on `<domain>.overview.list.fields.<field>` moves to `<domain>.overview.list.<field>`; a label on the bare field key keeps working.

Use only keys from the file or keys already in the app. Some v2 keys from the file aren't in the default catalog, because shared filter and table texts are read through them; they're still correct.

## Styling

See `references/css-overrides.md`.
