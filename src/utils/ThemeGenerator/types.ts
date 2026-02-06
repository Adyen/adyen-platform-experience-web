export interface ThemeProps {
    primary?: string;
    outline?: string;
    neutral?: string;
    background?: string;
    label?: string;
    dark?: boolean;
}

export interface ColorRamps {
    primary?: Record<string, string>;
    outline?: Record<string, string>;
    neutral?: Record<string, string>;
    background?: Record<string, string>;
    label?: Record<string, string>;
}

export type ColorCategory = 'primary' | 'outline' | 'neutral' | 'background' | 'label';

export type ThemeMode = 'light' | 'dark';

export type LightnessStep = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export type LightnessMap = Record<LightnessStep, number | null>;

export interface SemanticMapping {
    variable: string;
    category: ColorCategory;
    step: LightnessStep;
}
