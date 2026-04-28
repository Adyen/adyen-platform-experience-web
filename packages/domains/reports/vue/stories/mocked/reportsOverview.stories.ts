import type { Meta, StoryObj } from '@storybook/vue3';
import { ReportsOverviewMeta, type ReportsOverviewStoryArgs } from '../components/reportsOverview';

const meta: Meta<ReportsOverviewStoryArgs> = {
    ...ReportsOverviewMeta,
    title: 'Mocked/Reports/Reports Overview',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};
