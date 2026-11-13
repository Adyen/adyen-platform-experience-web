import type { Meta } from '@storybook/vue3';
import { containerControl, type ElementProps, type ElementStory } from '@integration-components/testing/storybook-helpers';
import { TransactionsOverviewElement, type TransactionsOverviewExternalProps } from '../../domains/transactions/vue/src';

const meta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    title: 'SDK/Appearance',
    argTypes: {
        container: containerControl(),
    },
    args: {
        component: TransactionsOverviewElement,
        mockedApi: true,
    },
};

export default meta;

/**
 * Any mocked component works here. The story exists to exercise the appearance options that every
 * component inherits from the shared provider (global Core appearance and component overrides).
 */
export const Default: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Default',
};
