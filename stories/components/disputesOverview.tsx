import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { DisputesOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const DisputesOverviewMeta: Meta<ElementProps<typeof DisputesOverview>> = {
    title: 'screens/Reports',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        preferredLimit: 10,
        allowLimitSelection: true,
        hideTitle: false,
        onContactSupport: () => {},
        component: DisputesOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
