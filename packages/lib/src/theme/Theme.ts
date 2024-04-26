type ColorScale = { [index: string]: string };

type Colors = {
    primary?: string;
    neutral?: string;
    label?: string;
    critical?: string;
    success?: string;
    warning?: string;
    background?: string;
    outline?: string;
};

const NEUTRAL_VARIABLES: ColorScale = {
    'color-outline-primary': '400',
    'color-outline-primary-hover': '600',
    'color-outline-secondary': '600',
    'color-outline-secondary-hover': '800',
    'color-outline-tertiary': '1300',
    'color-outline-tertiary-hover': '1700',
    'color-outline-disabled': '400',
    'color-background-primary-hover': '100',
    'color-background-primary-active': '200',
    'color-background-secondary': '100',
    'color-background-secondary-hover': '200',
    'color-background-secondary-active': '200',
    'color-background-tertiary': '200',
    'color-background-tertiary-hover': '300',
    'color-background-tertiary-active': '400',
    'color-background-quaternary': '700',
    'color-background-quaternary-hover': '800',
    'color-background-quaternary-active': '900',
    'color-background-modal-hover': '100',
    'color-background-modal-active': '200',
    'color-background-always-light-hover': '100',
    'color-background-always-light-active': '200',
    'color-background-always-light-disabled': '200',
    'color-background-always-dark-disabled': '200',
    'color-background-disabled': '200',
    'color-separator-primary': '400',
    'color-separator-secondary': '600',
    'color-separator-inverse-primary': '2500',
    'color-separator-inverse-secondary': '1900',
};
const PRIMARY_VARIABLES: ColorScale = {
    'color-outline-primary-active': '3200',
    'color-outline-secondary-active': '3200',
    'color-outline-tertiary-active': '3200',
    'color-outline-selected': '3200',
    'color-background-inverse-primary': '3200',
    'color-background-inverse-primary-hover': '1900',
    'color-background-inverse-primary-active': '1300',
    'color-background-inverse-secondary': '2800',
    'color-background-inverse-secondary-hover': '2600',
    'color-background-inverse-secondary-active': '2400',
    'color-background-always-dark': '3200',
    'color-background-always-dark-hover': '1900',
    'color-background-always-dark-active': '1300',
};
const CRITICAL_VARIABLES: ColorScale = {
    'color-label-critical': '1700',
    'color-label-critical-hover': '1900',
    'color-label-critical-active': '2500',
    'color-label-warning': '1700',
    'color-label-on-background-critical-weak': '1900',
    'color-label-on-background-warning-weak': '1900',
    'color-outline-critical': '1700',
    'color-outline-critical-hover': '1900',
    'color-outline-critical-active': '2500',
    'color-background-critical-weak': '100',
    'color-background-critical-strong': '1700',
    'color-background-critical-strong-hover': '1900',
    'color-background-warning-weak': '100',
    'color-background-warning-strong': '1300',
};
const LABEL_VARIABLES: ColorScale = {
    'color-label-primary': '3200',
    'color-label-primary-hover': '1900',
    'color-label-primary-active': '1300',
    'color-label-secondary': '1900',
    'color-label-tertiary': '1300',
    'color-label-disabled': '1300',
};
const SUCCESS_VARIABLES: ColorScale = {
    'color-label-success': '1900',
    'color-outline-success': '1700',
    'color-outline-success-hover': '1900',
    'color-outline-success-active': '2500',
    'color-label-on-background-success-weak': '1900',
    'color-background-success-weak': '100',
    'color-background-success-strong': '1700',
};
const WARNING_VARIABLES: ColorScale = {
    'color-label-warning': '1700',
    'color-label-on-background-warning-weak': '1900',
    'color-background-warning-weak': '100',
    'color-background-warning-strong': '1300',
};

const OUTLINE_VARIABLES: ColorScale = {
    'color-outline-primary': '400',
    'color-outline-primary-hover': '600',
    'color-outline-secondary': '600',
    'color-outline-secondary-hover': '800',
    'color-outline-tertiary': '1300',
    'color-outline-tertiary-hover': '1700',
    'color-outline-disabled': '400',
};

const BACKGROUND_VARIABLES = {
    'color-background-primary': '$my-primary-background',
    'color-background-modal': '$my-primary-background',
};
export class Theme {
    private readonly colors: Colors;
    constructor(colors: Colors) {
        this.colors = colors;
    }

    hexToHsl(hex: string): [number, number, number] {
        // Convert hex to RGB
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        // Convert RGB to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h,
            s,
            l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // Achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h /= 6;
            h *= 360;
            s *= 100;
        }

        l *= 100;
        return [h, s, l];
    }

    generateColorScale(baseColor: string, baseIndex: number, count = 34): ColorScale {
        // Convert the main HEX color to HSL
        const [hue, saturation, mainLightness] = this.hexToHsl(baseColor);

        // Initialize the scale with the main color
        const scale = { [`${baseIndex}00`]: `hsl(${hue}, ${saturation}%, ${mainLightness}%)` };

        // Determine the step for lightness before and after the main color
        const lightnessStepBefore = mainLightness / (baseIndex - 1);
        const lightnessStepAfter = (100 - mainLightness) / (count - baseIndex);

        // Generate the colors before the main color
        for (let i = 0; i < baseIndex - 1; i++) {
            const lightness = mainLightness - lightnessStepBefore * (baseIndex - 1 - i);
            scale[`${i}00`] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }

        // Generate the colors after the main color
        for (let i = baseIndex + 1; i < count; i++) {
            const lightness = mainLightness + lightnessStepAfter * (i - baseIndex + 1);
            scale[`${i}00`] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }

        return scale;
    }

    generateGreyScale(baseColor: string, baseIndex = 1, count = 34): ColorScale {
        const [hue, mainSaturation, mainLightness] = this.hexToHsl(baseColor);
        const scale: ColorScale = {};
        const lightnessStep = (mainLightness - 0) / (count - baseIndex);
        const saturationStep = (mainSaturation - 0) / (count - baseIndex);

        // Create the color scale
        for (let i = 0; i <= count; i++) {
            if (i === baseIndex) {
                scale[`${baseIndex}00`] = `hsl(${hue}, ${mainSaturation}%, ${mainLightness}%)`;
            } else {
                let currentSaturation;
                let currentLightness;

                if (i < baseIndex) {
                    // Before the main color - higher lightness and saturation
                    currentSaturation = mainSaturation + saturationStep * (baseIndex - i - 1);
                    currentLightness = mainLightness + lightnessStep * (baseIndex - i - 1);
                } else {
                    // From the main color to the darkest color - decreasing lightness and saturation
                    currentSaturation = mainSaturation - saturationStep * (i - baseIndex + 1);
                    currentLightness = mainLightness - lightnessStep * (i - baseIndex + 1);
                }

                // Clamp values to ensure they are within the valid range
                currentSaturation = Math.max(0, Math.min(100, currentSaturation));
                currentLightness = Math.max(0, Math.min(100, currentLightness));

                scale[`${i}00`] = `hsl(${hue}, ${currentSaturation}%, ${currentLightness}%)`;
            }
        }

        return scale;
    }

    setCssVariables(colorMap: ColorScale, variableName: string, value: string): void {
        const cssVarName = `--adyen-sdk-${variableName}`;
        const colorValue = colorMap[value] || null;
        document.documentElement.style.setProperty(cssVarName, colorValue);
    }

    generateVariables({ color, variables, baseIndex, greyScale }: { color: string; variables: ColorScale; baseIndex: number; greyScale?: boolean }) {
        for (const key in variables) {
            const value = variables[key]!;
            const primaryScale = greyScale ? this.generateGreyScale(color, baseIndex) : this.generateColorScale(color, baseIndex);
            this.setCssVariables(primaryScale, key, value);
        }
    }
    invertColorLightness(color: string, fallbackColor: string) {
        const [hue, saturation, lightness] = this.hexToHsl(color);
        const [fallbackHue, fallbackSaturation, fallbackLightness] = this.hexToHsl(fallbackColor);

        // If the color is light (lightness > 70%), return the fallback color with adjusted lightness
        if (lightness > 70) {
            // Reduce lightness by 10% for the fallback color, ensuring it doesn't go below 0
            const adjustedLightness = Math.max(fallbackLightness - 10, 0);
            return `hsl(${fallbackHue}, ${fallbackSaturation}%, ${adjustedLightness}%)`;
        } else {
            // If the color is not light, create a color with inverted lightness
            const invertedLightness = 100 - lightness;
            return `hsl(${hue}, ${saturation}%, ${invertedLightness}%)`;
        }
    }

    apply() {
        const variablesConfig: {
            [k in keyof Colors]: {
                baseIndex: number;
                variables: ColorScale;
                greyScale?: boolean;
            };
        } = {
            primary: {
                baseIndex: 32,
                variables: PRIMARY_VARIABLES,
            },
            neutral: {
                baseIndex: 1,
                variables: NEUTRAL_VARIABLES,
                greyScale: true,
            },
            label: {
                baseIndex: 32,
                variables: LABEL_VARIABLES,
            },
            success: {
                baseIndex: 19,
                variables: SUCCESS_VARIABLES,
            },
            warning: {
                baseIndex: 19,
                variables: WARNING_VARIABLES,
            },
            critical: {
                baseIndex: 19,
                variables: CRITICAL_VARIABLES,
            },
            outline: {
                baseIndex: 4,
                variables: OUTLINE_VARIABLES,
                greyScale: true,
            },
        };

        for (const key in variablesConfig) {
            const variablesKey = key as keyof typeof variablesConfig;
            if (this.colors[variablesKey]) {
                this.generateVariables({
                    color: this.colors[variablesKey]!,
                    baseIndex: variablesConfig[variablesKey]!.baseIndex,
                    variables: variablesConfig[variablesKey]!.variables,
                    greyScale: variablesConfig[variablesKey]?.greyScale,
                });
            }
        }
        if (this.colors.background) {
            Object.keys(BACKGROUND_VARIABLES).forEach(variable => {
                const cssVarName = `--adyen-sdk-${variable}`;
                document.documentElement.style.setProperty(cssVarName, this.colors.background!);
            });
        }
    }
}
