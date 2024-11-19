import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { action } from '@storybook/addon-actions';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverview>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        hideTitle: false,
        onContactSupport: action('onContactSupport'),
        component: CapitalOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
