import type { Meta } from '@storybook/vue3';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { PietExternalProps } from '../../src';
import { PietElement } from '../../src';

export const pietMeta: Meta<ElementProps<PietExternalProps>> = {
    title: 'Components/Piet/Piet',
    argTypes: {
        chat: { control: 'object' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        appearance: { table: { disable: true } },
    },
    args: {
        component: PietElement,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
