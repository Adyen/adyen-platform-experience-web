import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        externalDynamicOffersConfig: { control: 'object' },
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
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 600, width: '100%' }}>{Story()}</div>],
};
