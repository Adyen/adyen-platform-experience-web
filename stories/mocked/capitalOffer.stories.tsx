import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital Offer' };

export const Basic: ElementStory<typeof CapitalOffer> = {
    name: 'Basic',
    args: {
        mockedApi: true,
        externalDynamicOffersConfig: {
            minAmount: {
                value: 100000,
                currency: 'EUR',
            },
            maxAmount: {
                value: 2500000,
                currency: 'EUR',
            },
            step: 10000,
        },
    },
};

export default meta;
