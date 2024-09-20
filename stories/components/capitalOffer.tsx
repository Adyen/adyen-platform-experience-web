import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { CapitalOffer } from '../../src';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        dynamicOffersConfig: { control: 'object' },
        hideTitle: { type: 'boolean' },
        onOfferSigned: enabledDisabledCallbackRadioControls('onOfferSigned'),
        balanceAccountId: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        dynamicOffersConfig: undefined,
        hideTitle: false,
        onOfferSigned: () => {},
        component: CapitalOffer,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
