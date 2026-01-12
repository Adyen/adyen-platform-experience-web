import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../../src';
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';
import { ElementProps } from '../../utils/types';

export const PaymentLinkCreationMeta: Meta<ElementProps<typeof PaymentLinkCreation>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        component: PaymentLinkCreation,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story()}</div>],
};
