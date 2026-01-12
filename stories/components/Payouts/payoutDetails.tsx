import { Meta } from '@storybook/preact';
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';
import { PayoutDetails } from '../../../src';
import { ElementProps } from '../../utils/types';

export const PayoutDetailsMeta: Meta<ElementProps<typeof PayoutDetails>> = {
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
