import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onOfferSelect: enabledDisabledCallbackRadioControls('onOfferSelect'),
        hideTitle: { type: 'boolean' },
        onFundsRequest: {
            table: {
                disable: true,
            },
        },
        balanceAccountId: {
            table: {
                disable: true,
            },
        },
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
