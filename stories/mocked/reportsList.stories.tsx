import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { ReportsOverview } from '../../src';
import { ReportsMeta } from '../components/reportsList';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsMeta, title: 'Mocked/Reports' };

export const Basic: ElementStory<typeof ReportsOverview> = {
    name: 'Basic',
    args: {
        mockedApi: true,
    },
};

export default meta;
