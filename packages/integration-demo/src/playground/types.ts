export type ControlValues = Record<string, string>;

export interface ControlOption {
    label: string;
    value: string;
}

interface BaseControl {
    key: string;
    label: string;
    hint?: string;
    defaultValue?: string;
    remount?: boolean;
}

export interface TextControl extends BaseControl {
    type: 'text';
    placeholder?: string;
}

export interface ToggleControl extends BaseControl {
    type: 'toggle';
}

export interface ChoiceControl extends BaseControl {
    type: 'radio' | 'select' | 'checkboxes';
    options: readonly ControlOption[];
}

export type Control = TextControl | ToggleControl | ChoiceControl;

export interface ControlSection {
    title: string;
    controls: readonly Control[];
}
