import type { Meta } from '@storybook/vue3';
import type { TransactionsOverviewExternalProps } from '../../src';
import TransactionsOverviewElement from '../../src/TransactionsOverview/TransactionsOverviewElement';
import { ElementProps, dataGridDensityControl, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const transactionsOverviewMeta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    title: 'Components/Transactions/Transactions Overview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        allowLimitSelection: { control: 'boolean' },
        dataGridDensity: dataGridDensityControl(),
        appearance: { table: { disable: true } },
    },
    args: {
        component: TransactionsOverviewElement,
        allowLimitSelection: true,
        dataGridDensity: 'default',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
