import { Meta } from '@storybook/preact';
import { DisputesManagementElement } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ElementProps } from '../utils/types';

export const DisputesManagementMeta: Meta<ElementProps<typeof DisputesManagementElement>> = {
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        hideTitle: false,
        onContactSupport: () => {},
        component: DisputesManagementElement,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
};
