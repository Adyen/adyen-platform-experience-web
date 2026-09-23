import type { Meta } from '@storybook/vue3';
import type { TransactionsOverviewExternalProps } from '../../src';
import TransactionsOverviewElement from '../../src/TransactionsOverview/TransactionsOverviewElement';
import { ElementProps, densityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const TransactionsOverviewMeta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    title: 'Components/Transactions/Transactions Overview',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        hideTitle: { control: 'boolean' },
        showDetails: { control: 'boolean' },
        allowLimitSelection: { control: 'boolean' },
        density: densityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: TransactionsOverviewElement,
        allowLimitSelection: true,
        showDetails: true,
        density: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
