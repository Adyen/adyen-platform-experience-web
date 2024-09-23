import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Mocked/CapitalOverview' };

export const Basic: ElementStory<typeof CapitalOverview> = {
    name: 'Basic',
    args: {
        mockedApi: true,
    },
};

export default meta;
