import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsOverview } from '../../src';
import { ElementProps } from '../utils/types';

export const TransactionsMeta: Meta<ElementProps<typeof TransactionsOverview>> = {
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        preferredLimit: { type: 'number', min: 1, max: 100 },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        allowLimitSelection: true,
        hideTitle: false,
        onContactSupport: () => {},
        component: TransactionsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
