import chroma from 'chroma-js';
import { ANCHOR_STEP, CSS_VAR_PREFIX, LIGHTNESS_STEPS, SEMANTIC_MAPPINGS, STEPS } from './constants';
import type { ColorCategory, ColorRamps, ThemeMode, ThemeProps } from './types';

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const STYLE_ELEMENT_ID = 'adyen-sdk-theme-generator';

export class ThemeGenerator {
    private styleElement: HTMLStyleElement | null = null;
    private ramps: ColorRamps | null = null;

    create(props: ThemeProps): void {
        const mode: ThemeMode = props.dark ? 'dark' : 'light';
        const categories: ColorCategory[] = ['primary', 'outline', 'neutral', 'background', 'label'];

        this.ramps = {};

        for (const category of categories) {
            const inputColor = props[category];
            if (!inputColor) {
                continue;
            }

            const sanitizedColor = this.sanitizeColor(inputColor);
            this.ramps[category] = this.generateRamp(sanitizedColor, mode);
        }

        if (Object.keys(this.ramps).length === 0) {
            this.removeStyleElement();
            this.ramps = null;
            return;
        }

        this.injectCSS(this.ramps, mode);
    }

    destroy(): void {
        this.removeStyleElement();
        this.ramps = null;
    }

    private removeStyleElement(): void {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
        this.styleElement = null;
    }

    getRamps(): ColorRamps | null {
        return this.ramps;
    }

    private sanitizeColor(color: string): string {
        const trimmed = color.trim().toLowerCase();

        if (!HEX_COLOR_REGEX.test(trimmed)) {
            throw new Error(`Invalid hex color: "${color}". Expected format: #RGB or #RRGGBB.`);
        }

        return trimmed;
    }

    private generateRamp(inputColor: string, mode: ThemeMode): Record<string, string> {
        const lightnessMap = LIGHTNESS_STEPS[mode];
        const [hue, saturation] = chroma(inputColor).hsl();
        const ramp: Record<string, string> = {};

        for (const step of STEPS) {
            const targetLightness = lightnessMap[step];

            if (targetLightness === null) {
                // Anchor step: use the exact input color
                ramp[String(step)] = inputColor;
            } else {
                // Generate color with same hue/saturation but adjusted lightness
                const l = targetLightness / 100;
                ramp[String(step)] = chroma.hsl(hue, saturation, l).hex();
            }
        }

        return ramp;
    }

    private injectCSS(ramps: ColorRamps, mode: ThemeMode): void {
        this.removeStyleElement();

        const variables: string[] = [];
        const categories: ColorCategory[] = ['primary', 'outline', 'neutral', 'background', 'label'];
        const outlineFallbackVariables = new Set([
            'color-outline-primary-active',
            'color-outline-secondary-active',
            'color-outline-tertiary-active',
            'color-outline-selected',
        ]);
        const shouldFallbackToPrimary = !ramps.outline && !!ramps.primary;

        // Numbered variables: --adyen-sdk-color-{category}-{step}
        for (const category of categories) {
            const ramp = ramps[category];
            if (!ramp) {
                continue;
            }
            for (const step of STEPS) {
                const varName = `${CSS_VAR_PREFIX}color-${category}-${step}`;
                variables.push(`${varName}: ${ramp[String(step)]};`);
            }
        }

        // Semantic variables
        for (const mapping of SEMANTIC_MAPPINGS) {
            const usePrimaryFallback = shouldFallbackToPrimary && outlineFallbackVariables.has(mapping.variable);
            const ramp = usePrimaryFallback ? ramps.primary : ramps[mapping.category];
            if (ramp) {
                const varName = `${CSS_VAR_PREFIX}${mapping.variable}`;
                const step = usePrimaryFallback ? ANCHOR_STEP : mapping.step;
                variables.push(`${varName}: ${ramp[String(step)]};`);
            }
        }

        const css = `:root {\n  ${variables.join('\n  ')}\n}`;

        this.styleElement = document.createElement('style');
        this.styleElement.id = STYLE_ELEMENT_ID;
        this.styleElement.textContent = css;
        document.head.appendChild(this.styleElement);
    }
}
