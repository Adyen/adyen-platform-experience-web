import { Meta } from '@storybook/preact';
import { DisputeManagement } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ElementProps } from '../utils/types';

export const DisputeManagementMeta: Meta<ElementProps<typeof DisputeManagement>> = {
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        component: DisputeManagement,
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
};
