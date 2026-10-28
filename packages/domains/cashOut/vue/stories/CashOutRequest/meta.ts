import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutRequestElement } from '../../src';

export const cashOutRequestMeta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    argTypes: {
        // The balance accounts come from the session, so this global story arg doesn't apply.
        balanceAccountId: { table: { disable: true } },
        referenceForBeneficiary: { control: 'text' },
        transferDescription: { control: 'text' },
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
