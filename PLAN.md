# ThemeGenerator Utility Class 

Create a TypeScript utility class that generates CSS color variables at runtime using chroma-js, matching the Bento design system structure while preserving input colors and generating semantic tokens.
The basic idea is to get some basic colors from our users and replace the CSS variables that we use for some that adapt to their colors. For that, we need to map the current variables to the new values, values that make sense in the scale that is in @Colors.svg
---

## Overview

**Input**: Flat object with base colors + optional dark mode flag
```ts
{ 
  primary: '#2292bc', 
  outline: '#1e506a', 
  neutral: '#2d3251', 
  background: '#151726', 
  label: '#ebebeb',
  dark?: true  // Optional dark mode flag
}
```

**Output**: CSS variables injected into `:root` with two types:
1. **Numbered scales**: `--adyen-sdk-color-primary-10` through `--adyen-sdk-color-primary-100`
2. **Semantic tokens**: `--adyen-sdk-color-primary`, `--adyen-sdk-color-primary-hover`, `--adyen-sdk-color-background-primary`, etc.

---

## Key Requirements

### Requirement 1: Preserve Input Colors
The exact input color MUST appear in the generated scale. For example, if `primary: '#2292bc'` is provided, this exact hex value must be accessible in the output (anchored at step 60).

### Requirement 2: Generate Semantic Tokens
In addition to numbered scales, generate semantic CSS variables that map to appropriate scale steps. For example:
- `--adyen-sdk-color-primary` → maps to `primary-60` (the input color)
- `--adyen-sdk-color-primary-hover` → maps to `primary-70` (lighter in light theme, darker in dark theme)

---

## Post‑Review Clarifications (Iteration Log)
The following items capture the additional prompts/decisions discovered after multiple iterations. These are required to complete the task without further back‑and‑forth.

### Scope & Mapping Rules
- **Map “Group A only”** semantic tokens: include neutral/primary‑derived tokens and exclude status/decorative tokens (critical, warning, success, spotlight, etc.).
- **Source of truth:** `@adyen/bento-design-tokens` light theme aliases (`aliases.scss`). Match each semantic token to the nearest ramp step by **lightness**.

### Accent Color Handling (#001222)
- Treat tokens using **#001222** as accent **when it makes sense**, using the **exact `theme.primary` value** (anchor step 60), not a derived ramp shade.
- Explicit list requested:
  - `color-background-inverse-primary`
  - `color-background-always-dark-primary`
  - `color-outline-selected`
  - `color-outline-secondary-active`
  - `color-outline-tertiary-active`
  - `color-outline-primary-active`

### Outline Behavior (Conditional Primary Fallback)
- **If `outline` is missing** and `primary` is defined, then the outline active/selected semantic tokens must **fall back to `primary` at step 60**.
- **If both `outline` and `primary` are defined**, then:
  - `color-outline-primary-active` **must use the primary value** (anchor step 60).
  - Other outline tokens continue using the outline ramp.

### Theme Props Optionality
- **Theme colors are optional**. Only generate ramps for provided colors; skip undefined categories.
- If **no ramps are generated**, remove any injected style element and skip CSS injection.

### Label Mapping Adjustments
- Label extremes were too dark; adjust label semantic mappings to match Bento lightness more closely.
- Use the closest step by lightness for label tokens like:
  - `color-label-primary-active` → step 60
  - `color-label-inverse-disabled` → step 60
  - `color-label-always-light-secondary-active` → step 60
  - `color-label-always-light-tertiary` / `-hover` → step 60

### Testing Adjustments
- Add tests for outline active/selected **fallback** when outline is missing.
- Add test for `color-outline-primary-active` **using primary** when both outline and primary are present.
- Hue drift in chroma HSL round‑trips can occur at extreme lightness steps; allow a small tolerance (<5°).

---

## Implementation Steps

### 1. Install Dependencies
```bash
npm install chroma-js
npm install --save-dev @types/chroma-js
```

### 2. Create File Structure

```
src/
└── utils/
    └── ThemeGenerator/
        ├── ThemeGenerator.ts       # Main class implementation
        ├── ThemeGenerator.test.ts  # Unit tests
        ├── constants.ts            # Lightness steps + semantic mappings
        ├── types.ts                # TypeScript interfaces
        └── index.ts                # Public export
```

### 3. Define Type Definitions

**File**: `src/utils/ThemeGenerator/types.ts`

```ts
export interface ThemeProps {
  primary: string;
  outline: string;
  neutral: string;
  background: string;
  label: string;
  dark?: boolean;
}

export interface ColorRamps {
  primary: Record<string, string>;
  outline: Record<string, string>;
  neutral: Record<string, string>;
  background: Record<string, string>;
  label: Record<string, string>;
}

export type ColorCategory = 'primary' | 'outline' | 'neutral' | 'background' | 'label';
```

### 4. Define Constants

**File**: `src/utils/ThemeGenerator/constants.ts`

```ts
// For example: You need to extract the correct ones fron Colors.svg
export const LIGHTNESS_STEPS = {
  light: {
    10: 97,
    20: 93,
    30: 87,
    40: 78,
    50: 65,
    60: null,  // ANCHOR - uses original color's lightness
    70: 35,
    80: 25,
    90: 15,
    100: 7
  },
  dark: {
    10: 7,
    20: 12,
    30: 18,
    40: 25,
    50: 35,
    60: null,  // ANCHOR - uses original color's lightness
    70: 65,
    80: 78,
    90: 87,
    100: 97
  }
} as const;

````
**Semantic tokens** (mapped from ramp steps, following `src/style/bento/aliases.scss` patterns):
```
# Primary (accent)
--adyen-sdk-color-primary → primary-60
--adyen-sdk-color-primary-hover → primary-70
--adyen-sdk-color-primary-active → primary-80
--adyen-sdk-color-background-selected → primary-20
--adyen-sdk-color-background-selected-hover → primary-20
--adyen-sdk-color-background-selected-active → primary-30
--adyen-sdk-color-background-highlight-weak → primary-10
--adyen-sdk-color-background-highlight-strong → primary-70
--adyen-sdk-color-label-highlight → primary-70
--adyen-sdk-color-link-primary → primary-70
--adyen-sdk-color-link-primary-hover → primary-70
--adyen-sdk-color-link-primary-active → primary-70
--adyen-sdk-color-link-primary-disabled → primary-50

# Background
--adyen-sdk-color-background-primary → background-10
--adyen-sdk-color-background-primary-hover → background-10
--adyen-sdk-color-background-primary-active → background-20
--adyen-sdk-color-background-secondary → background-10
--adyen-sdk-color-background-secondary-hover → background-20
--adyen-sdk-color-background-secondary-active → background-30
--adyen-sdk-color-background-tertiary → background-20
--adyen-sdk-color-background-tertiary-hover → background-30
--adyen-sdk-color-background-tertiary-active → background-30
--adyen-sdk-color-background-quaternary → background-40
--adyen-sdk-color-background-quaternary-hover → background-40
--adyen-sdk-color-background-quaternary-active → background-50
--adyen-sdk-color-background-modal → background-10
--adyen-sdk-color-background-modal-hover → background-10
--adyen-sdk-color-background-modal-active → background-20
--adyen-sdk-color-background-disabled → background-20
--adyen-sdk-color-background-inverse-primary → primary-60
--adyen-sdk-color-background-inverse-primary-hover → background-70
--adyen-sdk-color-background-inverse-primary-active → background-70
--adyen-sdk-color-background-inverse-secondary → background-90
--adyen-sdk-color-background-inverse-secondary-hover → background-80
--adyen-sdk-color-background-inverse-secondary-active → background-80
--adyen-sdk-color-background-inverse-disabled → background-80
--adyen-sdk-color-background-always-light → background-10
--adyen-sdk-color-background-always-light-hover → background-10
--adyen-sdk-color-background-always-light-active → background-20
--adyen-sdk-color-background-always-light-disabled → background-20
--adyen-sdk-color-background-always-light-selected → background-20
--adyen-sdk-color-background-always-dark → background-100
--adyen-sdk-color-background-always-dark-hover → background-70
--adyen-sdk-color-background-always-dark-active → background-50
--adyen-sdk-color-background-always-dark-disabled → background-20
--adyen-sdk-color-background-always-dark-selected → background-90
--adyen-sdk-color-background-always-dark-primary → primary-60
--adyen-sdk-color-background-always-dark-primary-hover → background-90
--adyen-sdk-color-background-always-dark-primary-active → background-90
--adyen-sdk-color-background-always-dark-primary-disabled → background-20
--adyen-sdk-color-background-always-dark-primary-selected → background-90
--adyen-sdk-color-background-always-dark-secondary → background-90
--adyen-sdk-color-background-always-dark-secondary-hover → background-80
--adyen-sdk-color-background-always-dark-secondary-active → background-70
--adyen-sdk-color-background-always-dark-secondary-disabled → background-20
--adyen-sdk-color-background-always-dark-secondary-selected → background-90
--adyen-sdk-color-background-always-dark-tertiary → background-80
--adyen-sdk-color-background-always-dark-tertiary-hover → background-80
--adyen-sdk-color-background-always-dark-tertiary-active → background-70
--adyen-sdk-color-background-always-dark-tertiary-disabled → background-20
--adyen-sdk-color-background-always-dark-tertiary-selected → background-90

# Label
--adyen-sdk-color-label-primary → label-100
--adyen-sdk-color-label-primary-hover → label-70
--adyen-sdk-color-label-primary-active → label-60
--adyen-sdk-color-label-secondary → label-70
--adyen-sdk-color-label-tertiary → label-50
--adyen-sdk-color-label-disabled → label-50
--adyen-sdk-color-label-on-color → label-10
--adyen-sdk-color-label-inverse-primary → label-10
--adyen-sdk-color-label-inverse-primary-hover → label-10
--adyen-sdk-color-label-inverse-primary-active → label-20
--adyen-sdk-color-label-inverse-secondary → label-50
--adyen-sdk-color-label-inverse-disabled → label-60
--adyen-sdk-color-label-always-light → label-10
--adyen-sdk-color-label-always-light-primary → label-20
--adyen-sdk-color-label-always-light-primary-hover → label-40
--adyen-sdk-color-label-always-light-primary-active → label-50
--adyen-sdk-color-label-always-light-secondary → label-50
--adyen-sdk-color-label-always-light-secondary-hover → label-50
--adyen-sdk-color-label-always-light-secondary-active → label-60
--adyen-sdk-color-label-always-light-tertiary → label-60
--adyen-sdk-color-label-always-light-tertiary-hover → label-60
--adyen-sdk-color-label-always-light-tertiary-active → label-70
--adyen-sdk-color-label-always-dark → label-100

# Outline
--adyen-sdk-color-outline-primary → outline-30
--adyen-sdk-color-outline-primary-hover → outline-40
--adyen-sdk-color-outline-primary-active → outline-100
--adyen-sdk-color-outline-secondary → outline-40
--adyen-sdk-color-outline-secondary-hover → outline-40
--adyen-sdk-color-outline-secondary-active → outline-100
--adyen-sdk-color-outline-tertiary → outline-50
--adyen-sdk-color-outline-tertiary-hover → outline-70
--adyen-sdk-color-outline-tertiary-active → outline-100
--adyen-sdk-color-outline-disabled → outline-30
--adyen-sdk-color-outline-selected → outline-100
--adyen-sdk-color-outline-inverse-primary → outline-80
--adyen-sdk-color-outline-inverse-primary-hover → outline-70
--adyen-sdk-color-outline-inverse-primary-active → outline-50
--adyen-sdk-color-outline-inverse-disabled → outline-70

# Separator (mapped to outline)
--adyen-sdk-color-separator-primary → outline-30
--adyen-sdk-color-separator-secondary → outline-40
--adyen-sdk-color-separator-inverse-primary → outline-80
--adyen-sdk-color-separator-inverse-secondary → outline-70
```



```

### 5. Color Ramp Logic (from Colors.svg analysis)

**Lightness Steps** (extracted from SVG color fills):

| Step | Light Theme L% | Dark Theme L% |
|------|----------------|---------------|
| 10   | 97%            | 7%            |
| 20   | 93%            | 12%           |
| 30   | 87%            | 18%           |
| 40   | 78%            | 25%           |
| 50   | 65%            | 35%           |
| 60   | 50%            | 50%           |
| 70   | 35%            | 65%           |
| 80   | 25%            | 78%           |
| 90   | 15%            | 87%           |
| 100  | 7%             | 97%           |

**Process**: Parse Hex → HSL → Apply lightness steps (preserving H & S) → Convert back to Hex

### 6. Public Export

**File**: `src/utils/ThemeGenerator/index.ts`

```ts
export { ThemeGenerator } from './ThemeGenerator';
export type { ThemeProps, ColorRamps } from './types';
```

---

## Usage Example

```ts
import { ThemeGenerator } from './utils/ThemeGenerator';

const themeGen = new ThemeGenerator();

// Create theme
themeGen.create({
  primary: '#2292bc',
  outline: '#1e506a',
  neutral: '#2d3251',
  background: '#151726',
  label: '#ebebeb',
  dark: false
});

// Generated CSS variables:
// Numbered: --adyen-sdk-color-primary-10, --adyen-sdk-color-primary-20, ..., --adyen-sdk-color-primary-100
// Semantic: --adyen-sdk-color-primary (=#2292bc), --adyen-sdk-color-primary-hover, etc.

// Clean up
themeGen.destroy();
```

---

## Testing Requirements

**File**: `src/utils/ThemeGenerator/ThemeGenerator.test.ts`

Test cases:
1. ✅ Input color `#2292bc` appears exactly at the base step. You need to understand what's the base step from the Colors.svg scale
2. ✅ All 10 numbered variables (10-100) are generated per category
3. ✅ Semantic variables map to correct numbered steps. Also calculate this from Colors.svg
4. ✅ Light/dark themes generate different lightness values
5. ✅ `destroy()` removes injected style element
6. ✅ Hue and saturation are preserved across all steps
7. ✅ Step 60 (anchor) uses exact input color for all categories

---

## Output Example

Given `primary: '#2292bc'` in light theme:

**Numbered variables**:
```css
:root {
  --adyen-sdk-color-primary-10: #f5fbfd;  /* 97% lightness */
  --adyen-sdk-color-primary-20: #e5f5f9;  /* 93% lightness */
  /* ... */
  --adyen-sdk-color-primary-60: #2292bc;  /* EXACT INPUT COLOR */
  --adyen-sdk-color-primary-70: #176482;  /* 35% lightness */
  /* ... */
  --adyen-sdk-color-primary-100: #091e28; /* 7% lightness */
}
```

**Semantic variables**:
```css
:root {
  --adyen-sdk-color-primary: #2292bc;              /* = primary-60 */
  --adyen-sdk-color-primary-hover: #176482;        /* = primary-70 */
  --adyen-sdk-color-primary-active: #0f4a60;       /* = primary-80 */
  --adyen-sdk-color-background-primary: #f5fbfd;   /* = background-10 */
  --adyen-sdk-color-label-primary: #ebebeb;        /* = label-100 (original input) */
}
```

---

## Implementation Checklist

- [ ] Install chroma-js dependencies (with pnpm)
- [ ] Create file structure
- [ ] Define types in `types.ts`
- [ ] Define constants in `constants.ts` (lightness steps + semantic mappings)
- [ ] Implement `ThemeGenerator.ts` class with all methods
- [ ] Implement validation logic (hex regex, sanitization)
- [ ] Implement color ramp generation (anchor at step 60)
- [ ] Implement numbered variable creation
- [ ] Implement semantic variable creation
- [ ] Implement CSS injection/removal
- [ ] Write unit tests
- [ ] Verify input colors are preserved exactly at step 60
- [ ] Verify semantic tokens map correctly to numbered steps
- [ ] Test light/dark theme switching
- [ ] Create public export in `index.ts`
