# v1 CSS and its v2 replacement

In v2, `adyen-pe-*` class names are no longer stable: **only the root `.adyen-pe-component` wrapper remains**. Any other `.adyen-pe-*` selector, or styling by DOM structure, silently stops applying. For each override, work out what it achieved and apply the first rule that matches.

## 1. CSS variables (`--adyen-sdk-*`)

Variable names are unchanged and still supported, but v2 defines every variable on each mount element, so **overrides at document level (`:root`, `html`, `body`) no longer reach the components**. Move them:

- for one component: onto its mount element, with a selector that outranks the SDK's attribute selector, e.g. `#transactions-overview { --adyen-sdk-border-radius-s: 10px; }`;
- for every component: onto `.adyen-pe-component { ... }`.

Move them with the same values, without asking: they already applied to every component in v1, so moving them doesn't widen their effect. Don't turn them into a theme proposal; rule 3 is for overrides that set colours or `border-radius` directly.

## 2. Overrides that v2 options replace

| What the v1 override did                                    | Example v1 selectors                                    | v2 replacement                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Removed the card look (background, padding, border, radius) | `.adyen-pe-component__container`                        | `appearance: { container: 'hidden' }` on the component, or on Core   |
| Hid titles                                                  | `.adyen-pe-header__title`, `.adyen-pe-header`           | `appearance: { titles: 'hidden' }`                                   |
| Hid empty-state or error illustrations                      | `.adyen-pe-error-message-display__illustration`         | `appearance: { illustrations: 'hidden' }`                            |
| Denser data-grid rows                                       | `.adyen-pe-data-grid__cell`, `.adyen-pe-data-grid__row` | `appearance: { dataGrid: { density: 'condensed' } }`                 |
| Hid a data-grid column                                      | `.adyen-pe-data-grid__cell:nth-child(n)`                | `dataCustomization.dataGrid.fields: [{ key, visibility: 'hidden' }]` |
| Hid Disputes tabs                                           | `.adyen-pe-tabs__tab` in Disputes Overview              | `tabs: { hidden: [...] }` on `DisputesOverview`                      |

Delete the override once replaced. Overrides on `.adyen-pe-component` itself (e.g. `box-sizing`) stay.

## 3. Colours, dark mode and corner radius: the theme

For overrides that set colours or `border-radius`, look at the properties, not the selector, and map them to the Core theme options:

| v1 override styled                                       | Theme setting (Core `customTheme`, per `light` and `dark`)                                                       |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Accent: buttons, links, active tabs, selected rows       | `primary`                                                                                                        |
| Component and card backgrounds                           | `background`                                                                                                     |
| Text and link text                                       | `label`                                                                                                          |
| Borders and dividers                                     | `outline`                                                                                                        |
| Subtle surfaces: table headers, hover rows, muted panels | `neutral`                                                                                                        |
| `border-radius`                                          | `roundness`: `'small'` (4px), `'medium'` (8px) or `'large'` (12px), the nearest step                             |
| Dark-mode styles                                         | `customTheme.dark` for the colours, and `themeMode: 'dark'`; switch at runtime with `core.update({ themeMode })` |

- Colours must be `#RGB` or `#RRGGBB`. Convert `rgb()`, `hsl()` or named colours; other formats throw an error.
- Hover and active shades are generated from each colour, so don't map them separately.
- If a setting is too broad, or a radius must be exact, set the specific `--adyen-sdk-*` variable on `.adyen-pe-component` instead (rule 1), e.g. `--adyen-sdk-color-outline-primary` or `--adyen-sdk-border-radius-m: 12px`.
- Then delete the override.

**Theme changes are global: propose them, don't apply them.** A v1 override usually styled one element; a theme setting changes every element with that role, in every component that uses this Core instance, on every page. So:

1. Don't write `customTheme`, `themeMode` or new theme variables during the migration (variables the app already set are moved by rule 1). Migrate everything else, and delete the v1 overrides as usual (they match nothing in v2).
2. End your turn with a **theme proposal**: for each v1 override, the setting and value that would replace it, and a clear warning of what else it changes. For example: "`customTheme.light.outline: '#e5e7eb'` would replace your border colour on the transactions table. **This changes every border and divider in all Adyen components, not only that table.**" Then ask: "Do you want me to apply these theme settings?"
3. Apply them only after the user confirms. If the user already confirmed in this conversation, apply them directly. When you apply them, add a comment next to `customTheme`: `// Applies to every Adyen component that uses this core.`

## 4. Known unsupported

No v2 option covers these, and the selectors match nothing in v2. Delete the override, and list it in the report with what it did, so the user knows the customization is gone and can request it from Adyen:

- spacing, width or layout changes beyond the card look and row density, and font changes (e.g. `max-width` on `.adyen-pe-overview-details` or `.adyen-pe-modal`);
- hiding elements that no `appearance`, `tabs` or `dataCustomization` option covers.

Never re-target these at v2's internal class names (`.b-*`, `[data-v-*]`, teleported modal containers): they change without notice.
