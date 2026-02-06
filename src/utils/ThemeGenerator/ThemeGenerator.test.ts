/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import chroma from 'chroma-js';
import { ThemeGenerator } from './ThemeGenerator';
import { ANCHOR_STEP, LIGHTNESS_STEPS, SEMANTIC_MAPPINGS, STEPS } from './constants';
import type { ColorCategory, ThemeProps } from './types';

const LIGHT_THEME_PROPS: ThemeProps = {
    primary: '#2292bc',
    outline: '#1e506a',
    neutral: '#2d3251',
    background: '#151726',
    label: '#ebebeb',
    dark: false,
};

const DARK_THEME_PROPS: ThemeProps = {
    ...LIGHT_THEME_PROPS,
    dark: true,
};

const CATEGORIES: ColorCategory[] = ['primary', 'outline', 'neutral', 'background', 'label'];

describe('ThemeGenerator', () => {
    let generator: ThemeGenerator;

    beforeEach(() => {
        generator = new ThemeGenerator();
    });

    afterEach(() => {
        generator.destroy();
    });

    describe('input color preservation', () => {
        test('input color appears exactly at the anchor step (step 60)', () => {
            generator.create(LIGHT_THEME_PROPS);
            const ramps = generator.getRamps()!;

            for (const category of CATEGORIES) {
                const inputColor = LIGHT_THEME_PROPS[category] as string;
                expect(ramps[category][String(ANCHOR_STEP)]).toBe(inputColor.toLowerCase());
            }
        });

        test('input color appears exactly at anchor step in dark mode', () => {
            generator.create(DARK_THEME_PROPS);
            const ramps = generator.getRamps()!;

            for (const category of CATEGORIES) {
                const inputColor = DARK_THEME_PROPS[category] as string;
                expect(ramps[category][String(ANCHOR_STEP)]).toBe(inputColor.toLowerCase());
            }
        });
    });

    describe('numbered variable generation', () => {
        test('all 10 numbered variables (10-100) are generated per category', () => {
            generator.create(LIGHT_THEME_PROPS);
            const ramps = generator.getRamps()!;

            for (const category of CATEGORIES) {
                for (const step of STEPS) {
                    expect(ramps[category][String(step)]).toBeDefined();
                    expect(ramps[category][String(step)]).toMatch(/^#[0-9a-f]{6}$/);
                }
            }
        });

        test('numbered CSS variables are injected into the DOM', () => {
            generator.create(LIGHT_THEME_PROPS);
            const style = document.getElementById('adyen-sdk-theme-generator') as HTMLStyleElement;
            expect(style).not.toBeNull();

            for (const category of CATEGORIES) {
                for (const step of STEPS) {
                    expect(style.textContent).toContain(`--adyen-sdk-color-${category}-${step}`);
                }
            }
        });
    });

    describe('semantic variable generation', () => {
        test('semantic variables are injected and map to correct numbered steps', () => {
            generator.create(LIGHT_THEME_PROPS);
            const ramps = generator.getRamps()!;
            const style = document.getElementById('adyen-sdk-theme-generator') as HTMLStyleElement;

            for (const mapping of SEMANTIC_MAPPINGS) {
                const expectedColor = ramps[mapping.category][String(mapping.step)];
                expect(style.textContent).toContain(`--adyen-sdk-${mapping.variable}: ${expectedColor}`);
            }
        });

        test('color-primary semantic token equals the exact input color', () => {
            generator.create(LIGHT_THEME_PROPS);
            const style = document.getElementById('adyen-sdk-theme-generator') as HTMLStyleElement;
            expect(style!.textContent).toContain(`--adyen-sdk-color-primary: ${LIGHT_THEME_PROPS.primary.toLowerCase()}`);
        });
    });

    describe('light/dark theme differences', () => {
        test('light and dark themes generate different lightness values for non-anchor steps', () => {
            generator.create(LIGHT_THEME_PROPS);
            const lightRamps = generator.getRamps()!;
            const lightPrimary10 = lightRamps.primary['10']!;

            generator.create(DARK_THEME_PROPS);
            const darkRamps = generator.getRamps()!;
            const darkPrimary10 = darkRamps.primary['10']!;

            expect(lightPrimary10).not.toBe(darkPrimary10);

            // Light step 10 should be very light (high lightness)
            const lightL = chroma(lightPrimary10).get('hsl.l');
            expect(lightL).toBeGreaterThan(0.9);

            // Dark step 10 should be very dark (low lightness)
            const darkL = chroma(darkPrimary10).get('hsl.l');
            expect(darkL).toBeLessThan(0.15);
        });

        test('light theme step 10 is lightest and step 100 is darkest', () => {
            generator.create(LIGHT_THEME_PROPS);
            const ramps = generator.getRamps()!;

            const l10 = chroma(ramps.primary['10']!).get('hsl.l');
            const l100 = chroma(ramps.primary['100']!).get('hsl.l');
            expect(l10).toBeGreaterThan(l100);
        });

        test('dark theme step 10 is darkest and step 100 is lightest', () => {
            generator.create(DARK_THEME_PROPS);
            const ramps = generator.getRamps()!;

            const l10 = chroma(ramps.primary['10']!).get('hsl.l');
            const l100 = chroma(ramps.primary['100']!).get('hsl.l');
            expect(l10).toBeLessThan(l100);
        });
    });

    describe('destroy', () => {
        test('removes injected style element from the DOM', () => {
            generator.create(LIGHT_THEME_PROPS);
            expect(document.getElementById('adyen-sdk-theme-generator')).not.toBeNull();

            generator.destroy();
            expect(document.getElementById('adyen-sdk-theme-generator')).toBeNull();
        });

        test('clears internal ramps', () => {
            generator.create(LIGHT_THEME_PROPS);
            expect(generator.getRamps()).not.toBeNull();

            generator.destroy();
            expect(generator.getRamps()).toBeNull();
        });
    });

    describe('hue and saturation preservation', () => {
        test('hue and saturation are preserved across all steps', () => {
            generator.create(LIGHT_THEME_PROPS);
            const ramps = generator.getRamps()!;

            for (const category of CATEGORIES) {
                const inputColor = LIGHT_THEME_PROPS[category] as string;
                const [inputHue, inputSat] = chroma(inputColor).hsl();

                for (const step of STEPS) {
                    if (step === ANCHOR_STEP) continue;

                    const generatedColor = ramps[category][String(step)]!;
                    const [genHue, genSat] = chroma(generatedColor).hsl();

                    // Hue should be preserved within a small tolerance.
                    // HSL round-trips at extreme lightness values (7%, 97%) cause
                    // minor hue drift; <5 degrees is visually imperceptible.
                    if (!isNaN(inputHue) && !isNaN(genHue)) {
                        const hueDiff = Math.abs(genHue - inputHue);
                        expect(hueDiff).toBeLessThan(5);
                    }

                    // Saturation should be preserved
                    if (inputSat > 0.01) {
                        expect(genSat).toBeCloseTo(inputSat, 1);
                    }
                }
            }
        });
    });

    describe('validation', () => {
        test('throws on invalid hex color', () => {
            expect(() =>
                generator.create({
                    ...LIGHT_THEME_PROPS,
                    primary: 'not-a-color',
                })
            ).toThrow(/Invalid hex color/);
        });

        test('throws on rgb() format', () => {
            expect(() =>
                generator.create({
                    ...LIGHT_THEME_PROPS,
                    primary: 'rgb(255, 0, 0)',
                })
            ).toThrow(/Invalid hex color/);
        });

        test('accepts 3-digit hex shorthand', () => {
            expect(() =>
                generator.create({
                    ...LIGHT_THEME_PROPS,
                    primary: '#abc',
                })
            ).not.toThrow();
        });
    });

    describe('re-creation', () => {
        test('calling create twice replaces previous style element', () => {
            generator.create(LIGHT_THEME_PROPS);
            generator.create(DARK_THEME_PROPS);

            const styles = document.querySelectorAll('#adyen-sdk-theme-generator');
            expect(styles.length).toBe(1);
        });
    });
});
