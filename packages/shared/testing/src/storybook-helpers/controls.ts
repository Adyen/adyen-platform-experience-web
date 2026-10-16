import { action } from 'storybook/actions';

export const enabledDisabledCallbackRadioControls = (actionName: string, optionsLabels?: [string, string]) => {
    return {
        control: { type: 'inline-radio' },
        options: optionsLabels ?? ['Enabled', 'Disabled'],
        mapping: {
            [optionsLabels?.[1] ?? 'Disabled']: undefined,
            [optionsLabels?.[0] ?? 'Enabled']: action(actionName),
        },
    } as const;
};

export const dataGridDensityControl = () =>
    ({
        name: 'dataGridDensity',
        control: { type: 'inline-radio' },
        options: ['default', 'condensed'],
    }) as const;

export const containerControl = () =>
    ({
        name: 'container',
        description: 'Component-level `appearance.container`. Leave unset to inherit the global appearance.',
        control: { type: 'inline-radio' },
        options: ['visible', 'hidden'],
    }) as const;
