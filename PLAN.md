# ThemeGenerator Utility Class 

Create a TypeScript utility class that generates CSS color variables at runtime using chroma-js, matching the Bento design system structure while preserving input colors and generating semantic tokens.
The basic idea is to get some basic colors from our users and replace the CSS variables that we use for some that adapt to their colors. For that, we need to map the current variables to the new values, values that make sense in the scale that is in Colors.svg
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
--adyen-sdk-color-background-primary         → background-10
--adyen-sdk-color-background-primary-hover   → background-20
--adyen-sdk-color-background-primary-active  → background-30
--adyen-sdk-color-label-primary              → label-100
--adyen-sdk-color-label-secondary            → label-70
--adyen-sdk-color-outline-primary            → outline-30
--adyen-sdk-color-outline-primary-hover      → outline-40
```
*(Full mapping to be defined during implementation)*



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
