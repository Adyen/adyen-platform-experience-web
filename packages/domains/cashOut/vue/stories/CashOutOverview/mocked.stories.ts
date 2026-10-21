import type { Meta, StoryObj } from '@storybook/vue3';
import { ElementProps } from '@integration-components/testing/storybook-helpers';
import { cashOutOverviewMeta } from './meta';
import { CashOutOverviewElement, type CashOutOverviewExternalProps } from '../../src/CashOutOverview';

type ElementStory = StoryObj<CashOutOverviewExternalProps & { mockedApi?: boolean }>;

const meta: Meta<ElementProps<typeof CashOutOverviewElement>> = {
    ...cashOutOverviewMeta,
    title: 'Mocked/CashOut/CashOut Overview',
};

export const MultipleBalanceAccounts: ElementStory = {
    name: 'Multiple balance accounts',
    args: {
        mockedApi: true,
    },
};

export default meta;
