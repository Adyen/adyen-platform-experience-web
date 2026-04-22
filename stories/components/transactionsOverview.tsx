import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { TransactionsOverview } from '../../src';
import { ElementProps } from '@integration-components/testing/storybook-helpers';

export const TransactionsOverviewMeta: Meta<ElementProps<typeof TransactionsOverview>> = {
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        preferredLimit: { type: 'number', min: 1, max: 100 },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        allowLimitSelection: true,
        component: TransactionsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
