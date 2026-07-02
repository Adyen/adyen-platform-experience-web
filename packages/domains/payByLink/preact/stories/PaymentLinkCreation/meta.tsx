import { Meta } from '@storybook/preact';
import { PaymentLinkCreation } from '../../src';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

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
