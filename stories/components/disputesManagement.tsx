import { Meta } from '@storybook/preact';
import DisputeManagementElement from '../../src/components/external/DisputesManagement/DisputeManagementElement';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ElementProps } from '../utils/types';

export const DisputesManagementMeta: Meta<ElementProps<typeof DisputeManagementElement>> = {
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
