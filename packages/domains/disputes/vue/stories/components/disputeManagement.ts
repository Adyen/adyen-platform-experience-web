import type { Meta } from '@storybook/vue3';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import DisputeManagement from '../../src/DisputeManagement/DisputeManagementWrapper.vue';

export const DisputeManagementMeta: Meta<ElementProps<typeof DisputeManagement>> = {
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
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
