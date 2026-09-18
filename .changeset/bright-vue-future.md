---
"@adyen/adyen-platform-experience-web": major
---

- Migrated all components from the Preact runtime to Vue 3, alongside a massive UI refresh and several other improvements. The public API contract remains mostly unchanged.
- Added support for theming through the new `themeMode` and `customTheme` Core options.
- Removed the deprecated `availableTranslations` Core option.
- Removed flow-control callbacks and options across all Capital components, in favor of handling those flows internally.
- Removed support for CSS classname overrides across all components.
