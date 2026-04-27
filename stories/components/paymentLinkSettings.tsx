import { Meta } from '@storybook/preact';
import { PaymentLinkSettings } from '../../src';
import { enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { ElementProps } from '@integration-components/testing/storybook-helpers';

export const PaymentLinkSettingsMeta: Meta<ElementProps<typeof PaymentLinkSettings>> = {
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        storeIds: { type: 'string' },
    },
    args: {
        component: PaymentLinkSettings,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story() as JSX.Element}</div>],
};
