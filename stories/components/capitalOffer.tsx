import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferSelect: enabledDisabledCallbackRadioControls('onOfferSelect'),
    },
    args: {
        hideTitle: false,
        onFundsRequest: action('onRequestFunds'),
        component: CapitalOffer,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
