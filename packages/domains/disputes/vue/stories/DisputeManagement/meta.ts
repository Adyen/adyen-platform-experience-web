import type { Meta } from '@storybook/vue3';
import { DisputeManagementDefinition, type DisputeManagementDomainProps as DisputeManagementExternalProps } from '../../src/definitions';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const DisputeManagementMeta: Meta<ElementProps<DisputeManagementExternalProps>> = {
    title: 'Components/Disputes/Dispute Management',
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { control: 'boolean' },
    },
    args: {
        component: DisputeManagementDefinition,
        compact: true,
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
