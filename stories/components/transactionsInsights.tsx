import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { TransactionsInsights } from '../../src';
import { ElementProps } from '../utils/types';

export const TransactionsInsightsMeta: Meta<ElementProps<typeof TransactionsInsights>> = {
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        component: TransactionsInsights,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
