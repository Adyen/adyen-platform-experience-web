# Design Tokens — Bento

All visual styling must use `@adyen/bento-design-tokens` via the `style.token()` SCSS function.
**Never hardcode colors, spacing, borders, font sizes, or border-radii.**

## How It Works

Bento tokens are imported and exposed via `src/style/variable-generator.scss`:

```scss
@import '@adyen/bento-design-tokens/dist/scss-map/bento/aliases';
@import '@adyen/bento-design-tokens/dist/scss-map/bento/definitions';

$adyen-tokens-map: adyen-sdk-generate-css-variables($color, $text, $focus-ring, $spacer, $border);

@function token($token) {
    @return map-get($adyen-tokens-map, '#{$token}');
}
```

Each token maps to a CSS custom property (`--adyen-sdk-{token}`) with a Bento fallback value.
Consumers can override tokens via CSS custom properties.

## Using Tokens in SCSS

Every `.scss` file must import the style module to access `style.token()`:

```scss
@use '../../../style'; // adjust path to reach src/style/

.adyen-pe-my-component {
    background-color: style.token(color-background-primary);
    border: style.token(border-width-s) solid style.token(color-outline-primary);
    border-radius: style.token(border-radius-m);
    color: style.token(color-label-primary);
    font-size: style.token(text-body-font-size);
    gap: style.token(spacer-060);
    padding: style.token(spacer-080) style.token(spacer-060);
}
```

## Available Token Categories

Five token maps are loaded: `$color`, `$text`, `$focus-ring`, `$spacer`, `$border`.

### Colors

| Token                              | Purpose                     |
| ---------------------------------- | --------------------------- |
| `color-background-primary`         | Default background          |
| `color-background-primary-hover`   | Hover background            |
| `color-background-secondary`       | Alternate background        |
| `color-background-inverse-primary` | Inverted background (dark)  |
| `color-background-disabled`        | Disabled state background   |
| `color-label-primary`              | Default text color          |
| `color-label-secondary`            | Subdued text color          |
| `color-label-inverse-primary`      | Text on inverted background |
| `color-label-disabled`             | Disabled text               |
| `color-outline-primary`            | Default border color        |
| `color-outline-primary-active`     | Active/focused border       |
| `color-outline-secondary`          | Subdued border              |
| `color-outline-tertiary`           | Lightest border             |

### Spacing

| Token        | Value |
| ------------ | ----- |
| `spacer-000` | 0     |
| `spacer-010` | 2px   |
| `spacer-020` | 4px   |
| `spacer-030` | 6px   |
| `spacer-040` | 8px   |
| `spacer-050` | 12px  |
| `spacer-060` | 16px  |
| `spacer-070` | 20px  |
| `spacer-080` | 24px  |
| `spacer-090` | 32px  |
| `spacer-100` | 40px  |
| `spacer-110` | 48px  |
| `spacer-120` | 64px  |

### Borders

| Token             | Purpose           |
| ----------------- | ----------------- |
| `border-width-s`  | Thin border (1px) |
| `border-radius-s` | Small radius      |
| `border-radius-m` | Medium radius     |

### Typography

| Token                            | Purpose               |
| -------------------------------- | --------------------- |
| `text-body-font-size`            | Body text size        |
| `text-body-line-height`          | Body text line height |
| `text-body-stronger-font-weight` | Bold/semi-bold weight |

## Common Patterns

### Calculated values with tokens

```scss
// Use calc() when combining tokens with arithmetic
width: calc(#{style.token(spacer-060)} * 3);
inset: calc(#{style.token(spacer-020)} * -1);
```

### Conditional states

```scss
.adyen-pe-button {
    background-color: style.token(color-background-primary);

    &:hover {
        background-color: style.token(color-background-primary-hover);
    }

    &:disabled {
        background-color: style.token(color-background-disabled);
        color: style.token(color-label-disabled);
    }
}
```

### Focus rings

```scss
&:focus-visible {
    outline: style.token(focus-ring-outer);
    outline-offset: style.token(focus-ring-outer-offset);
}
```

## Anti-Patterns

```scss
// ❌ NEVER hardcode values
color: #333333;
padding: 16px;
border-radius: 4px;
gap: 8px;
font-size: 14px;

// ✅ ALWAYS use tokens
color: style.token(color-label-primary);
padding: style.token(spacer-060);
border-radius: style.token(border-radius-m);
gap: style.token(spacer-040);
font-size: style.token(text-body-font-size);
```

## Key Files

- **Token generator**: `src/style/variable-generator.scss`
- **Global style entry**: `src/style/index.scss`
- **Breakpoints**: `src/style/breakpoints.scss`
- **Accessibility mixins**: `src/style/accessibility.scss`
- **Package**: `@adyen/bento-design-tokens` (devDependency in `package.json`)

## Checklist

- [ ] All colors use `style.token(color-*)` — no hex, rgb, or named colors
- [ ] All spacing uses `style.token(spacer-*)` — no px values for margins/padding/gaps
- [ ] All borders use `style.token(border-*)` — no hardcoded widths or radii
- [ ] All font sizes use `style.token(text-*)` — no hardcoded px/rem/em
- [ ] SCSS file imports `@use` path to `src/style` module
- [ ] `calc()` wraps token with `#{}` interpolation when doing arithmetic
