type ColorScale = { [index: string]: string };

type Colors = {
    primary?: string;
    neutral?: string;
    label?: string;
    critical?: string;
    success?: string;
    warning?: string;
    background?: string;
};
function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
const standardScaleHex = [
    '#f7f7f8',
    '#eeeff1',
    '#e3e5e9',
    '#dbdee2',
    '#d1d5da',
    '#c9cdd3',
    '#c0c5cc',
    '#b8bdc6',
    '#afb5bf',
    '#a7adb8',
    '#9ea6b1',
    '#9ea6b1',
    '#8d95a3',
    '#848e9c',
    '#7d8696',
    '#747f8f',
    '#6d7789',
    '#647082',
    '#5c687c',
    '#556276',
    '#4c5a6e',
    '#455368',
    '#3d4c62',
    '#37455d',
    '#2f3e56',
    '#283750',
    '#22314a',
    '#1a2a44',
    '#14243e',
    '#0d1e38',
    '#071732',
    '#00112c',
    '#000b26',
    '#000814',
];

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
const BACKGROUND_VARIABLES = {
    'color-background-primary': '$my-primary-background',
    'color-background-modal': '$my-primary-background',
};
class Theme {
    private readonly colors: Colors;
    constructor(colors: Colors) {
        this.colors = colors;
    }

    hexToHsl(hex: string): [number, number, number] {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        (r /= 255), (g /= 255), (b /= 255);
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else if (max === b) h = (r - g) / d + 4;
            h /= 6;
            h *= 360;
        }
        return [h, s * 100, l * 100];
    }

    generateColorScale(baseColor: string, baseIndex: number, total = 34): ColorScale {
        const baseHsl = this.hexToHsl(baseColor);
        const colorScale: ColorScale = {};

        for (let i = 0; i < total; i++) {
            const [, s, l] = this.hexToHsl(standardScaleHex[i]!);
            if (i + 1 === baseIndex) {
                colorScale[`${i + 1}00`] = `hsl(${baseHsl[0]}, ${baseHsl[1]}%, ${baseHsl[2]}%)`;
            } else {
                const sClamped = baseHsl[1] + 1 * (s - baseHsl[1] * 0.3);
                const lClamped = Math.min(Math.max(l, 0), 100);
                colorScale[`${i + 1}00`] = `hsl(${baseHsl[0]}, ${sClamped}%, ${lClamped}%)`;
            }
        }

        return colorScale;
    }

    generateGreyScale(baseColor: string, baseIndex = 3): ColorScale {
        const standardScaleHsl = standardScaleHex.map(hex => this.hexToHsl(hex));
        const baseHsl = this.hexToHsl(baseColor);

        // Calculate the differences in saturation and lightness from the base index
        const standardBaseHsl = standardScaleHsl[baseIndex + 1]; // Adjust for zero-based index
        const sDiff = baseHsl[1] - standardBaseHsl![1] - baseHsl[1] * 0.3;
        const lDiff = baseHsl[2] - standardBaseHsl![2];

        // Generate the new scale based on the differences
        const newScale: { [key: string]: string } = {};

        standardScaleHsl.forEach((color, i) => {
            const adjustedH = baseHsl[0];
            const adjustedS = clamp(color[1] + sDiff, 0, 100);
            const adjustedL = clamp(color[2] + lDiff, 0, 100);
            newScale[`${i}00`] = `hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`;
        });

        return newScale;
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
                baseIndex: 32,
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
                baseIndex: 32,
                variables: CRITICAL_VARIABLES,
            },
            background: {
                baseIndex: 32,
                variables: BACKGROUND_VARIABLES,
            },
        };

        for (const key in variablesConfig) {
            const variablesKey = key as keyof typeof variablesConfig;
            if (this.colors[variablesKey]) {
                this.generateVariables({
                    color: this.colors[variablesKey]!,
                    baseIndex: variablesConfig[variablesKey]!.baseIndex,
                    variables: variablesConfig[variablesKey]!.variables,
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

export default Theme;
