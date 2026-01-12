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

export const disableControls = {
    table: {
        disable: true,
    },
};
