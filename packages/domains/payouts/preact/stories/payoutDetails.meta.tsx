import { Meta } from '@storybook/preact';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { PayoutDetails } from '@integration-components/payouts/publish';

export const PayoutDetailsMeta: Meta<ElementProps<typeof PayoutDetails>> = {
    title: 'screens/PayoutDetails',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
        date: { type: 'string' },
        id: { type: 'string' },
        balanceAccountId: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        component: PayoutDetails,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div className="compact-component-wrapper">{Story()}</div>],
};
