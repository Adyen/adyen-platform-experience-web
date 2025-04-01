import { Meta } from '@storybook/preact';
import DisputeManagement from '../../src/components/external/DisputesManagement/components/DisputeManagement';
import DisputeManagementElement from '../../src/components/external/DisputesManagement/DisputeManagementElement';
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

export const DisputesManagementMeta: Meta<ElementProps<typeof DisputeManagementElement>> = {
    title: 'screens/Reports',
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        hideTitle: false,
        onContactSupport: () => {},
        component: DisputeManagementElement,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
