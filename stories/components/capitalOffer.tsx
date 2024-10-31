import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        externalDynamicOffersConfig: { control: 'object' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        onRequestFunds: {
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
        externalDynamicOffersConfig: undefined,
        hideTitle: false,
        onRequestFunds: action('onRequestFunds'),
        component: CapitalOffer,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
