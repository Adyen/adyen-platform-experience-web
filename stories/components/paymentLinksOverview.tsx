import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PaymentLinksOverview } from '../../src';
import { ElementProps } from '../utils/types';

export const PaymentLinksOverviewMeta: Meta<ElementProps<typeof PaymentLinksOverview>> = {
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        storeIds: { type: 'string' },
        preferredLimit: { type: 'number', min: 1, max: 100 },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        allowLimitSelection: true,
        component: PaymentLinksOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
