import type { Meta } from '@storybook/vue3';
import type { DisputeManagementExternalProps } from '../../src';
import DisputeManagement from '../../src/DisputeManagement/DisputeManagementWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const DisputeManagementMeta: Meta<ElementProps<DisputeManagementExternalProps>> = {
    title: 'Components/Disputes/Dispute Management',
    component: DisputeManagement,
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: DisputeManagement,
        compact: true,
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
