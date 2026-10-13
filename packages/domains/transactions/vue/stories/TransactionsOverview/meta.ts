import type { Meta } from '@storybook/vue3';
import type { TransactionsOverviewExternalProps } from '../../src';
import TransactionsOverviewElement from '../../src/TransactionsOverview/TransactionsOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const transactionsOverviewMeta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    title: 'Components/Transactions/Transactions Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        pagination: { control: 'object' },
    },
    args: {
        component: TransactionsOverviewElement,
        pagination: { initialPageSize: 10, allowPageSizeSelection: true },
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
