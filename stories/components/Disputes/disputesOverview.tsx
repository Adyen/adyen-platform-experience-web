import { Meta } from '@storybook/preact';
import { ElementProps } from '../../utils/types';
import { DisputesOverview } from '../../../src';
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';

export const DisputesOverviewMeta: Meta<ElementProps<typeof DisputesOverview>> = {
    title: 'screens/DisputesOverview',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        preferredLimit: { type: 'number', min: 1, max: 100 },
        hideTitle: { type: 'boolean' },
        allowLimitSelection: { type: 'boolean' },
    },
    args: {
        component: DisputesOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
