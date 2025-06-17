import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { ReportsOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const ReportsMeta: Meta<ElementProps<typeof ReportsOverview>> = {
    title: 'screens/Reports',
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        hideTitle: false,
        onContactSupport: () => {},
        component: ReportsOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
