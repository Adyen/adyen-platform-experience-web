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
 * Semantic token mappings derived from Bento design token aliases (light theme).
 * Each entry maps a CSS variable name to its color category and closest ramp step.
 * Status/decorative tokens (critical, warning, success, spotlight, etc.) are excluded.
 */
export const SEMANTIC_MAPPINGS: SemanticMapping[] = [
    // Primary (accent) color
    { variable: 'color-primary', category: 'primary', step: 60 },
    { variable: 'color-primary-hover', category: 'primary', step: 70 },
    { variable: 'color-primary-active', category: 'primary', step: 80 },
    { variable: 'color-background-selected', category: 'primary', step: 20 },
    { variable: 'color-background-selected-hover', category: 'primary', step: 20 },
    { variable: 'color-background-selected-active', category: 'primary', step: 30 },
    { variable: 'color-background-highlight-weak', category: 'primary', step: 10 },
    { variable: 'color-background-highlight-strong', category: 'primary', step: 70 },
    { variable: 'color-label-highlight', category: 'primary', step: 70 },
    { variable: 'color-link-primary', category: 'primary', step: 70 },
    { variable: 'color-link-primary-hover', category: 'primary', step: 70 },
    { variable: 'color-link-primary-active', category: 'primary', step: 70 },
    { variable: 'color-link-primary-disabled', category: 'primary', step: 50 },

    // Background
    { variable: 'color-background-primary', category: 'background', step: 10 },
    { variable: 'color-background-primary-hover', category: 'background', step: 10 },
    { variable: 'color-background-primary-active', category: 'background', step: 20 },
    { variable: 'color-background-secondary', category: 'background', step: 10 },
    { variable: 'color-background-secondary-hover', category: 'background', step: 20 },
    { variable: 'color-background-secondary-active', category: 'background', step: 30 },
    { variable: 'color-background-tertiary', category: 'background', step: 20 },
    { variable: 'color-background-tertiary-hover', category: 'background', step: 30 },
    { variable: 'color-background-tertiary-active', category: 'background', step: 30 },
    { variable: 'color-background-quaternary', category: 'background', step: 40 },
    { variable: 'color-background-quaternary-hover', category: 'background', step: 40 },
    { variable: 'color-background-quaternary-active', category: 'background', step: 50 },
    { variable: 'color-background-modal', category: 'background', step: 10 },
    { variable: 'color-background-modal-hover', category: 'background', step: 10 },
    { variable: 'color-background-modal-active', category: 'background', step: 20 },
    { variable: 'color-background-disabled', category: 'background', step: 20 },
    { variable: 'color-background-inverse-primary', category: 'primary', step: 60 },
    { variable: 'color-background-inverse-primary-hover', category: 'background', step: 70 },
    { variable: 'color-background-inverse-primary-active', category: 'background', step: 70 },
    { variable: 'color-background-inverse-secondary', category: 'background', step: 90 },
    { variable: 'color-background-inverse-secondary-hover', category: 'background', step: 80 },
    { variable: 'color-background-inverse-secondary-active', category: 'background', step: 80 },
    { variable: 'color-background-inverse-disabled', category: 'background', step: 80 },
    { variable: 'color-background-always-light', category: 'background', step: 10 },
    { variable: 'color-background-always-light-hover', category: 'background', step: 10 },
    { variable: 'color-background-always-light-active', category: 'background', step: 20 },
    { variable: 'color-background-always-light-disabled', category: 'background', step: 20 },
    { variable: 'color-background-always-light-selected', category: 'background', step: 20 },
    { variable: 'color-background-always-dark', category: 'background', step: 100 },
    { variable: 'color-background-always-dark-hover', category: 'background', step: 70 },
    { variable: 'color-background-always-dark-active', category: 'background', step: 50 },
    { variable: 'color-background-always-dark-disabled', category: 'background', step: 20 },
    { variable: 'color-background-always-dark-selected', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-primary', category: 'primary', step: 60 },
    { variable: 'color-background-always-dark-primary-hover', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-primary-active', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-primary-disabled', category: 'background', step: 20 },
    { variable: 'color-background-always-dark-primary-selected', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-secondary', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-secondary-hover', category: 'background', step: 80 },
    { variable: 'color-background-always-dark-secondary-active', category: 'background', step: 70 },
    { variable: 'color-background-always-dark-secondary-disabled', category: 'background', step: 20 },
    { variable: 'color-background-always-dark-secondary-selected', category: 'background', step: 90 },
    { variable: 'color-background-always-dark-tertiary', category: 'background', step: 80 },
    { variable: 'color-background-always-dark-tertiary-hover', category: 'background', step: 80 },
    { variable: 'color-background-always-dark-tertiary-active', category: 'background', step: 70 },
    { variable: 'color-background-always-dark-tertiary-disabled', category: 'background', step: 20 },
    { variable: 'color-background-always-dark-tertiary-selected', category: 'background', step: 90 },

    // Label
    { variable: 'color-label-primary', category: 'label', step: 100 },
    { variable: 'color-label-primary-hover', category: 'label', step: 70 },
    { variable: 'color-label-primary-active', category: 'label', step: 60 },
    { variable: 'color-label-secondary', category: 'label', step: 70 },
    { variable: 'color-label-tertiary', category: 'label', step: 50 },
    { variable: 'color-label-disabled', category: 'label', step: 50 },
    { variable: 'color-label-on-color', category: 'label', step: 10 },
    { variable: 'color-label-inverse-primary', category: 'label', step: 10 },
    { variable: 'color-label-inverse-primary-hover', category: 'label', step: 10 },
    { variable: 'color-label-inverse-primary-active', category: 'label', step: 20 },
    { variable: 'color-label-inverse-secondary', category: 'label', step: 50 },
    { variable: 'color-label-inverse-disabled', category: 'label', step: 60 },
    { variable: 'color-label-always-light', category: 'label', step: 10 },
    { variable: 'color-label-always-light-primary', category: 'label', step: 20 },
    { variable: 'color-label-always-light-primary-hover', category: 'label', step: 40 },
    { variable: 'color-label-always-light-primary-active', category: 'label', step: 50 },
    { variable: 'color-label-always-light-secondary', category: 'label', step: 50 },
    { variable: 'color-label-always-light-secondary-hover', category: 'label', step: 50 },
    { variable: 'color-label-always-light-secondary-active', category: 'label', step: 60 },
    { variable: 'color-label-always-light-tertiary', category: 'label', step: 60 },
    { variable: 'color-label-always-light-tertiary-hover', category: 'label', step: 60 },
    { variable: 'color-label-always-light-tertiary-active', category: 'label', step: 70 },
    { variable: 'color-label-always-dark', category: 'label', step: 100 },

    // Outline
    { variable: 'color-outline-primary', category: 'outline', step: 30 },
    { variable: 'color-outline-primary-hover', category: 'outline', step: 40 },
    { variable: 'color-outline-primary-active', category: 'outline', step: 100 },
    { variable: 'color-outline-secondary', category: 'outline', step: 40 },
    { variable: 'color-outline-secondary-hover', category: 'outline', step: 40 },
    { variable: 'color-outline-secondary-active', category: 'outline', step: 100 },
    { variable: 'color-outline-tertiary', category: 'outline', step: 50 },
    { variable: 'color-outline-tertiary-hover', category: 'outline', step: 70 },
    { variable: 'color-outline-tertiary-active', category: 'outline', step: 100 },
    { variable: 'color-outline-disabled', category: 'outline', step: 30 },
    { variable: 'color-outline-selected', category: 'outline', step: 100 },
    { variable: 'color-outline-inverse-primary', category: 'outline', step: 80 },
    { variable: 'color-outline-inverse-primary-hover', category: 'outline', step: 70 },
    { variable: 'color-outline-inverse-primary-active', category: 'outline', step: 50 },
    { variable: 'color-outline-inverse-disabled', category: 'outline', step: 70 },

    // Separator (mapped to outline category)
    { variable: 'color-separator-primary', category: 'outline', step: 30 },
    { variable: 'color-separator-secondary', category: 'outline', step: 40 },
    { variable: 'color-separator-inverse-primary', category: 'outline', step: 80 },
    { variable: 'color-separator-inverse-secondary', category: 'outline', step: 70 },
];
