import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        externalDynamicOffersConfig: { control: 'object' },
        hideTitle: { type: 'boolean' },
        onOfferSigned: {
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
        onOfferSigned: action('onOfferSigned'),
        component: CapitalOffer,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 400, width: '100%' }}>{Story()}</div>],
};
