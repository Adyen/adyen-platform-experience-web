import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverview>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferOptionsRequest: enabledDisabledCallbackRadioControls('onOfferOptionsRequest'),
    },
    args: {
        hideTitle: false,
        component: CapitalOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
