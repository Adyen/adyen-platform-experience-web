import { Meta } from '@storybook/preact';
import { DisputeManagementElement } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { ElementProps } from '../utils/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';

export const DisputeManagementMeta: Meta<ElementProps<typeof DisputeManagementElement>> = {
    argTypes: {
        id: { type: 'string' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDetailsDismiss: enabledDisabledCallbackRadioControls('onDetailsDismiss'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        id: 'a1b2c3d4-e5f6-4789-abcd-000000000001',
        hideTitle: false,
        onContactSupport: action('onContactSupport'),
        component: DisputeManagementElement,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 500, width: '100%' }}>{Story()}</div>],
};
