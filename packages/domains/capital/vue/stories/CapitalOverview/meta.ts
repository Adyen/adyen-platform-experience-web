import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CapitalOverviewElement } from '../../src';

export const capitalOverviewMeta: Meta<ElementProps<typeof CapitalOverviewElement>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
    },
    args: {
        component: CapitalOverviewElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
