---
"@adyen/adyen-platform-experience-web": major
---

- Rebuilt all public SDK components on Vue 3 and removed the legacy Preact implementation. Component names and mounting lifecycle methods remain unchanged, but component instances and TypeScript contracts now use the Vue-backed `*ExternalProps` APIs; legacy Preact-specific types and instance behavior are no longer supported.
- Added support for theming through the new `themeMode` and `customTheme` Core options.
- Removed the deprecated `availableTranslations` option and simplified the Capital APIs. `CapitalOffer.onOfferSelect` and the external Capital Overview flow-control callbacks and options have been removed because those flows are now handled internally.
- Improved Pay By Link creation, overview, details, pagination, and accessibility behavior.
