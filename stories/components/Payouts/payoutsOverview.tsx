import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';
import { PayoutsOverview } from '../../../src';
import { ElementProps } from '../../utils/types';

export const PayoutsOverviewMeta: Meta<ElementProps<typeof PayoutsOverview>> = {
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        allowLimitSelection: true,
        component: PayoutsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
