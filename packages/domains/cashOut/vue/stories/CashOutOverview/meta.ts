import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutOverviewElement } from '../../src';

export const cashOutOverviewMeta: Meta<ElementProps<typeof CashOutOverviewElement>> = {
    argTypes: {
        // The balance accounts come from the session, so this global story arg doesn't apply.
        balanceAccountId: { table: { disable: true } },
        referenceForBeneficiary: { control: 'text' },
        transferDescription: { control: 'text' },
        onCashOutInstructed: enabledDisabledCallbackRadioControls('onCashOutInstructed'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
    },
    args: {
        component: CashOutOverviewElement,
        compact: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
