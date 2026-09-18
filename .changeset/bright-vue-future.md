---
"@adyen/adyen-platform-experience-web": major
---

- Migrated all components from the Preact runtime to Vue 3, alongside a massive UI refresh and several other improvements. The public API contract remains mostly unchanged.
- Added support for theming through the new `themeMode` and `customTheme` Core options.
- Removed the deprecated `availableTranslations` option and simplified the Capital APIs. `CapitalOffer.onOfferSelect` and the external Capital Overview flow-control callbacks and options have been removed because those flows are now handled internally.
- Improved Pay By Link creation, overview, details, pagination, and accessibility behavior.
