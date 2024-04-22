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
const NEUTRAL_VARIABLES = {
    'adyen-sdk-color-outline-primary': '400',
    'adyen-sdk-color-outline-primary-hover': '600',
    'adyen-sdk-color-outline-secondary': '600',
    'adyen-sdk-color-outline-secondary-hover': '800',
    'adyen-sdk-color-outline-tertiary': '1300',
    'adyen-sdk-color-outline-tertiary-hover': '1700',
    'adyen-sdk-color-outline-disabled': '400',
    'adyen-sdk-color-background-primary-hover': '100',
    'adyen-sdk-color-background-primary-active': '200',
    'adyen-sdk-color-background-secondary': '100',
    'adyen-sdk-color-background-secondary-hover': '200',
    'adyen-sdk-color-background-secondary-active': '200',
    'adyen-sdk-color-background-tertiary': '200',
    'adyen-sdk-color-background-tertiary-hover': '300',
    'adyen-sdk-color-background-tertiary-active': '400',
    'adyen-sdk-color-background-quaternary': '700',
    'adyen-sdk-color-background-quaternary-hover': '800',
    'adyen-sdk-color-background-quaternary-active': '900',
    'adyen-sdk-color-background-modal-hover': '100',
    'adyen-sdk-color-background-modal-active': '200',
    'adyen-sdk-color-background-always-light-hover': '100',
    'adyen-sdk-color-background-always-light-active': '200',
    'adyen-sdk-color-background-always-light-disabled': '200',
    'adyen-sdk-color-background-always-dark-disabled': '200',
    'adyen-sdk-color-background-disabled': '200',
    'adyen-sdk-color-separator-primary': '400',
    'adyen-sdk-color-separator-secondary': '600',
    'adyen-sdk-color-separator-inverse-primary': '2500',
    'adyen-sdk-color-separator-inverse-secondary': '1900',
};
const PRIMARY_VARIABLES = {
    'adyen-sdk-color-outline-primary-active': '3200',
    'adyen-sdk-color-outline-secondary-active': '3200',
    'adyen-sdk-color-outline-tertiary-active': '3200',
    'adyen-sdk-color-outline-selected': '3200',
    'adyen-sdk-color-background-inverse-primary': '3200',
    'adyen-sdk-color-background-inverse-primary-hover': '1900',
    'adyen-sdk-color-background-inverse-primary-active': '1300',
    'adyen-sdk-color-background-inverse-secondary': '2800',
    'adyen-sdk-color-background-inverse-secondary-hover': '2600',
    'adyen-sdk-color-background-inverse-secondary-active': '2400',
    'adyen-sdk-color-background-always-dark': '3200',
    'adyen-sdk-color-background-always-dark-hover': '1900',
    'adyen-sdk-color-background-always-dark-active': '1300',
};
const CRITICAL_VARIABLES = {
    'adyen-sdk-color-label-critical': '1700',
    'adyen-sdk-color-label-critical-hover': '1900',
    'adyen-sdk-color-label-critical-active': '2500',
    'adyen-sdk-color-label-warning': '1700',
    'adyen-sdk-color-label-on-background-critical-weak': '1900',
    'adyen-sdk-color-label-on-background-warning-weak': '1900',
    'adyen-sdk-color-outline-critical': '1700',
    'adyen-sdk-color-outline-critical-hover': '1900',
    'adyen-sdk-color-outline-critical-active': '2500',
    'adyen-sdk-color-background-critical-weak': '100',
    'adyen-sdk-color-background-critical-strong': '1700',
    'adyen-sdk-color-background-critical-strong-hover': '1900',
    'adyen-sdk-color-background-warning-weak': '100',
    'adyen-sdk-color-background-warning-strong': '1300',
};
const LABEL_VARIABLES = {
    'adyen-sdk-color-label-primary': '3200',
    'adyen-sdk-color-label-primary-hover': '1900',
    'adyen-sdk-color-label-primary-active': '1300',
    'adyen-sdk-color-label-secondary': '1900',
    'adyen-sdk-color-label-tertiary': '1300',
    'adyen-sdk-color-label-disabled': '1300',
};
const SUCCESS_VARIABLES = {
    'adyen-sdk-color-label-success': '1900',
    'adyen-sdk-color-outline-success': '1700',
    'adyen-sdk-color-outline-success-hover': '1900',
    'adyen-sdk-color-outline-success-active': '2500',
    'adyen-sdk-color-label-on-background-success-weak': '1900',
    'adyen-sdk-color-background-success-weak': '100',
    'adyen-sdk-color-background-success-strong': '1700',
};
const WARNING_VARIABLES = {
    'adyen-sdk-color-label-warning': '1700', // uses the same scale as critical but kept separate for clarity
    'adyen-sdk-color-label-on-background-warning-weak': '1900', // same as critical but keeping separate
    'adyen-sdk-color-background-warning-weak': '100',
    'adyen-sdk-color-background-warning-strong': '1300',
};

function hexToHsl(hex: string) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0;
    let s = 0;

    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
        h *= 360;
    }
    return [h, s * 100, l * 100]; // Return as [Hue, Saturation, Lightness]
}

const standardScaleHsl = standardScaleHex.map(hex => hexToHsl(hex));

function generateColorScale(baseColor: string, baseIndex: number, total = 34, saturationFactor = 1) {
    const baseHsl = hexToHsl(baseColor);

    const colorScale: { [key: string]: string } = {};

    for (let i = 1; i <= total; i++) {
        if (i === baseIndex) {
            colorScale[`${i}00`] = `hsl(${baseHsl[0]}, ${baseHsl[1]}%, ${baseHsl[2]}%)`;
        } else {
            const currentStandardHsl = standardScaleHsl[i - 1]; // Adjust index for zero-based array
            const adjustedS = baseHsl[1] + saturationFactor * (currentStandardHsl[1] - baseHsl[1]);
            const adjustedL = currentStandardHsl[2]; // Use original lightness for simplicity

            const sClamped = Math.min(Math.max(adjustedS, 0), 100);
            const lClamped = Math.min(Math.max(adjustedL, 0), 100);

            colorScale[`${i}00`] = `hsl(${baseHsl[0]}, ${sClamped}%, ${lClamped}%)`;
        }
    }
    return colorScale;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function generateGreyScale(baseColor, baseIndex = 3) {
    // Convert hex colors to HSL
    const standardScaleHsl = standardScaleHex.map(hex => hexToHsl(hex));
    const baseHsl = hexToHsl(baseColor);

    // Calculate the differences in saturation and lightness from the base index
    const standardBaseHsl = standardScaleHsl[baseIndex + 1]; // Adjust for zero-based index
    const sDiff = baseHsl[1] - standardBaseHsl[1] - baseHsl[1] * 0.3;
    const lDiff = baseHsl[2] - standardBaseHsl[2];

    // Generate the new scale based on the differences
    const newScale: { [key: string]: string } = {};

    standardScaleHsl.forEach((color, i) => {
        let adjustedH = baseHsl[0];
        let adjustedS = clamp(color[1] + sDiff, 0, 100);
        let adjustedL = clamp(color[2] + lDiff, 0, 100);
        newScale[`${i}00`] = `hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`;
    });

    return newScale;
}

const setCssVariables = (colorMap, variableName) => {
    Object.keys(colorMap).forEach(key => {
        const cssVarName = `--adyen-sdk-color-${variableName}-${key}`;
        const colorValue = colorMap[key];
        document.documentElement.style.setProperty(cssVarName, colorValue);
    });
};
