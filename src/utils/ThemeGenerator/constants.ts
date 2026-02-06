import type { LightnessMap, LightnessStep, SemanticMapping } from './types';

export const ANCHOR_STEP: LightnessStep = 60;

export const LIGHTNESS_STEPS: Record<'light' | 'dark', LightnessMap> = {
    light: {
        10: 97,
        20: 93,
        30: 87,
        40: 78,
        50: 65,
        60: null, // ANCHOR - uses original color's lightness
        70: 35,
        80: 25,
        90: 15,
        100: 7,
    },
    dark: {
        10: 7,
        20: 12,
        30: 18,
        40: 25,
        50: 35,
        60: null, // ANCHOR - uses original color's lightness
        70: 65,
        80: 78,
        90: 87,
        100: 97,
    },
};

export const STEPS: LightnessStep[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const CSS_VAR_PREFIX = '--adyen-sdk-';

/**
 * Semantic token mappings derived from bento design token aliases.
 * Each entry maps a CSS variable name to its color category and ramp step.
 *
 * Light theme aliases (aliases.scss):
 *   color-background-primary: #ffffff          → background-10 (97% L)
 *   color-background-primary-hover: #f4f5f6   → background-20 (93% L)
 *   color-background-primary-active: #ecedef   → background-30 (87% L)
 *   color-background-secondary: #f4f5f6       → background-20
 *   color-background-secondary-hover: #ecedef  → background-30
 *   color-background-secondary-active: #e2e5e7 → background-40
 *   color-background-tertiary: #ecedef         → background-30
 *   color-background-tertiary-hover: #e2e5e7   → background-40
 *   color-background-modal: #ffffff            → background-10
 *   color-background-disabled: #ecedef         → background-30
 *   color-label-primary: #001222               → label-100 (7% L)
 *   color-label-secondary: #5c6874             → label-70 (35% L)
 *   color-label-tertiary: #8c959d              → label-50 (65% L)
 *   color-label-disabled: #8c959d              → label-50
 *   color-label-on-color: #ffffff              → label-10 (97% L)
 *   color-outline-primary: #dadddf             → outline-30 (87% L)
 *   color-outline-primary-hover: #c8ccd0       → outline-40 (78% L)
 *   color-outline-primary-active: #001222      → outline-100 (7% L)
 *   color-outline-secondary: #c8ccd0           → outline-40
 *   color-outline-tertiary: #8c959d            → outline-50
 *   color-outline-disabled: #dadddf            → outline-30
 *   color-outline-selected: #001222            → outline-100
 *   color-separator-primary: #dadddf           → outline-30
 *   color-separator-secondary: #c8ccd0         → outline-40
 */
export const SEMANTIC_MAPPINGS: SemanticMapping[] = [
    // Primary (accent) color
    { variable: 'color-primary', category: 'primary', step: 60 },
    { variable: 'color-primary-hover', category: 'primary', step: 70 },
    { variable: 'color-primary-active', category: 'primary', step: 80 },

    // Background
    { variable: 'color-background-primary', category: 'background', step: 10 },
    { variable: 'color-background-primary-hover', category: 'background', step: 20 },
    { variable: 'color-background-primary-active', category: 'background', step: 30 },
    { variable: 'color-background-secondary', category: 'background', step: 20 },
    { variable: 'color-background-secondary-hover', category: 'background', step: 30 },
    { variable: 'color-background-secondary-active', category: 'background', step: 40 },
    { variable: 'color-background-tertiary', category: 'background', step: 30 },
    { variable: 'color-background-tertiary-hover', category: 'background', step: 40 },
    { variable: 'color-background-tertiary-active', category: 'background', step: 50 },
    { variable: 'color-background-modal', category: 'background', step: 10 },
    { variable: 'color-background-disabled', category: 'background', step: 30 },

    // Label
    { variable: 'color-label-primary', category: 'label', step: 100 },
    { variable: 'color-label-primary-hover', category: 'label', step: 70 },
    { variable: 'color-label-primary-active', category: 'label', step: 70 },
    { variable: 'color-label-secondary', category: 'label', step: 70 },
    { variable: 'color-label-tertiary', category: 'label', step: 50 },
    { variable: 'color-label-disabled', category: 'label', step: 50 },
    { variable: 'color-label-on-color', category: 'label', step: 10 },

    // Outline
    { variable: 'color-outline-primary', category: 'outline', step: 30 },
    { variable: 'color-outline-primary-hover', category: 'outline', step: 40 },
    { variable: 'color-outline-primary-active', category: 'outline', step: 100 },
    { variable: 'color-outline-secondary', category: 'outline', step: 40 },
    { variable: 'color-outline-secondary-hover', category: 'outline', step: 50 },
    { variable: 'color-outline-secondary-active', category: 'outline', step: 100 },
    { variable: 'color-outline-tertiary', category: 'outline', step: 50 },
    { variable: 'color-outline-disabled', category: 'outline', step: 30 },
    { variable: 'color-outline-selected', category: 'outline', step: 100 },

    // Separator (mapped to outline category)
    { variable: 'color-separator-primary', category: 'outline', step: 30 },
    { variable: 'color-separator-secondary', category: 'outline', step: 40 },
];
