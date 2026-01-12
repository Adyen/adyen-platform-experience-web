import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';
import { PaymentLinkDetails } from '../../../src';
import { ElementProps } from '../../utils/types';

export const PaymentLinkDetailsMeta: Meta<ElementProps<typeof PaymentLinkDetails>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
        hideTitle: { type: 'boolean' },
        id: { type: 'string' },
    },
    args: {
        component: PaymentLinkDetails,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story()}</div>],
};
