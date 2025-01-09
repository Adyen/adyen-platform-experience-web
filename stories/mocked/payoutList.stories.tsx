import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayoutsMeta } from '../components/payoutList';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsMeta, title: 'Mocked/Payouts Overview' };

export const Default: ElementStory<typeof PayoutsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
