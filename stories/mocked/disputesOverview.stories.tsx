import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { DisputesOverview } from '../../src';
import { DisputesOverviewMeta } from '../components/disputesOverview';

const meta: Meta<ElementProps<typeof DisputesOverview>> = { ...DisputesOverviewMeta, title: 'Mocked/Disputes Overview' };

export const Default: ElementStory<typeof DisputesOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
