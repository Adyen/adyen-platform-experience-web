import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutRequestElement } from '../../src';

export const cashOutRequestMeta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    argTypes: {
        onCashOutInstructed: enabledDisabledCallbackRadioControls('onCashOutInstructed'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
    },
    args: {
        component: CashOutRequestElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
