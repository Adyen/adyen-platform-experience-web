import { PayoutDetails } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { PayoutDetailsMeta } from '../components/payoutDetails';

const meta: Meta<ElementProps<typeof PayoutDetails>> = { ...PayoutDetailsMeta, title: 'Mocked/Payout Details' };

export const Default: ElementStory<typeof PayoutDetails> = {
    name: 'Default',
    args: {
        date: '2024-05-13T10%3A00%3A00.000Z',
        id: 'BA32272223222B5CTDQPM6W2H',
        mockedApi: true,
    },
};

export default meta;
