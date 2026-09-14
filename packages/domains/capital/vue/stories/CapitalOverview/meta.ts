import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import CapitalOverviewElement from '../../src/CapitalOverview/CapitalOverviewElement';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverviewElement>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
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
