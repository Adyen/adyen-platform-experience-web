import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { DisputesOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const DisputesOverviewMeta: Meta<ElementProps<typeof DisputesOverview>> = {
    title: 'screens/DisputesOverview',
    args: {
        component: DisputesOverview,
    },
};
