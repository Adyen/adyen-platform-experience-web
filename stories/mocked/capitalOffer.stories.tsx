import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';
import { DYNAMIC_CAPITAL_OFFER } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital Offer' };

export const Basic: ElementStory<typeof CapitalOffer> = {
    name: 'Basic',
    args: {
        mockedApi: true,
        externalDynamicOffersConfig: DYNAMIC_CAPITAL_OFFER,
    },
};

export default meta;
