import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { capitalOfferMeta } from '../components/capitalOffer';
import { CapitalOffer } from '../../src';

const meta: Meta<ElementProps<typeof CapitalOffer>> = { ...capitalOfferMeta, title: 'Mocked/Capital Offer' };

export const Basic: ElementStory<typeof CapitalOffer> = {
    name: 'Basic',
    args: {
        mockedApi: true,
    },
};

export default meta;
