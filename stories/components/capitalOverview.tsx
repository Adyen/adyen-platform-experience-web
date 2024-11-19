import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { action } from '@storybook/addon-actions';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverview>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferOptionsRequest: enabledDisabledCallbackRadioControls('onOfferOptionsRequest'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        hideTitle: false,
        onContactSupport: action('onContactSupport'),
        onFundsRequest: action('onFundsRequest'),
        onOfferDismiss: action('onOfferDismiss'),
        onOfferOptionsRequest: action('onOfferOptionsRequest'),
        component: CapitalOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
