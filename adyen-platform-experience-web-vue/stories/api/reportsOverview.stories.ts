import type { Meta, StoryObj } from '@storybook/vue3';
import { ReportsOverviewMeta, ReportsOverviewStoryArgs } from '../components/reportsOverview';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';

const meta: Meta<ReportsOverviewStoryArgs> = {
    ...ReportsOverviewMeta,
    title: 'API-connected/Reports/Reports Overview',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
    },
};
