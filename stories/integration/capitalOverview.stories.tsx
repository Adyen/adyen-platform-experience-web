import { ElementProps, ElementStory } from '../utils/types';
import { Meta } from '@storybook/preact';
import { CapitalOverview } from '../../src';
import { CapitalOverviewMeta } from '../components/capitalOverview';

const meta: Meta<ElementProps<typeof CapitalOverview>> = { ...CapitalOverviewMeta, title: 'Integration/CapitalOverview' };

export const Basic: ElementStory<typeof CapitalOverview> = {
    name: 'Basic',
    args: {},
};

export default meta;
