import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { ReportsOverview } from '../../src';
import { ReportsMeta } from '../components/reportsOverview';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsMeta, title: 'Mocked/Reports Overview' };

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export default meta;
