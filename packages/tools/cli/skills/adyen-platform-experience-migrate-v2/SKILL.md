---
name: adyen-platform-experience-migrate-v2
description: Migrate an app from Adyen Platform Experience components v1 to v2 (`@adyen/adyen-platform-experience-web` 1.x to 2.x). Covers removed and renamed Core options and component props, and replacing v1 CSS classname overrides with v2 options. Use when upgrading to v2 or fixing code that broke after the upgrade.
license: MIT
metadata:
    adyen-platform-experience-version: '2.0.0-alpha.1'
    adyen-platform-experience-components: 'capital-offer,capital-overview,dispute-management,disputes-overview,payment-link-creation,payment-link-details,payment-link-settings,payment-links-overview,payout-details,payouts-overview,reports-overview,transaction-details,transactions-overview'
---

# Migrate Adyen Platform Experience v1 to v2

## STOP: check these before editing any file

Do not edit, create or delete any file until all three checks pass. If one fails, make no changes at all: tell the user what failed and the command that fixes it, then end your turn. Don't migrate "partially" or "anyway", and don't fix the problem yourself.

1. **Clean working tree.** Run `git status --porcelain`. If it prints anything, the check fails: ask the user to commit or stash their changes first, so the migration is one diff they can review and revert.
2. **Matching version.** Find the installed version: `version` in `node_modules/@adyen/adyen-platform-experience-web/package.json`, in the app's folder or, in a workspace that hoists dependencies, the nearest parent folder that has it. With Yarn Plug'n'Play (no `node_modules`), run `yarn info @adyen/adyen-platform-experience-web version`. If the app loads the library with `<script>` tags, use the version in the script URL. If it isn't exactly the `metadata.adyen-platform-experience-version` above, the check fails: tell the user to run `npx @adyen/adyen-platform-experience-web skills sync` (or to upgrade the package first if it's still 1.x).
3. **Every component covered.** List the components the app imports from `@adyen/adyen-platform-experience-web`. If any isn't in `metadata.adyen-platform-experience-components` above, the check fails: tell the user to run `npx @adyen/adyen-platform-experience-web skills add` and select it.

Only when all three pass, continue.

## About v2

v2 refreshes the components' look. Most of the API is unchanged, but some Core options and component props were removed or renamed, and **CSS classname overrides no longer work**: v1 `.adyen-pe-*` selectors match nothing in v2.

## Rules while migrating

- **No DOM or classname workarounds.** Don't replace a removed override with `:deep()`, `querySelector` into a component, or new `.adyen-pe-*` selectors. Use the options in `references/css-overrides.md`; if v2 has no equivalent, delete the override and report what it did.
- **Theme changes are global: propose, don't apply.** Don't write `customTheme`, `themeMode` or `--adyen-sdk-*` theme variables until the user confirms. Propose them at the end with a clear warning that they change every matching element in all Adyen components (see `references/css-overrides.md`, rule 3).
- **Searching for overrides.** When searching for `adyen-pe-` selectors, exclude the assistant skill folders (`.agents/`, `.claude/`, `.cursor/`, `.factory/`): this skill quotes those selectors.

## Steps

1. Apply `references/global.md`: Core options, props every component shares, overview pagination and record selection, data customization, and custom translations.
2. For each component the code uses, apply its file in `references/` (named after the component, e.g. `references/transactions-overview.md`). For exact v2 signatures, read the component's props type in the installed package's `.d.ts` files, named in each reference file.
3. Fix imports from the package and calls on component instances with `references/exports-and-instances.md`.
4. Search the app for `dataCustomization` and `common.` translation keys: both change silently (a leftover `list` or an old key is ignored, with no type error when the object isn't typed).
5. Find every `adyen-pe-*` selector and `--adyen-sdk-*` variable in the app's stylesheets and style blocks, and apply `references/css-overrides.md`.
6. Run the project's type-check and build, and fix what they report.
7. End with a report:
    - every removed option or callback with no replacement, and what it did in this app;
    - every CSS override found, with file and line, and what you did with it: the v2 option that replaced it, where you moved it, or, if v2 has no equivalent, that you deleted it and what it did (suggest a feature request to Adyen);
    - the theme proposal with its warnings, and the question whether to apply it (unless the user already confirmed);
    - a reminder that v2 also refreshes the components' look, so the user should review each page that shows a component, even where no code changed.
