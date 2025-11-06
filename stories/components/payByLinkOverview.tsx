import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { PayByLinkOverview } from '../../src';
import { ElementProps } from '../utils/types';

export const PayByLinkOverviewMeta: Meta<ElementProps<typeof PayByLinkOverview>> = {
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
        component: PayByLinkOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
