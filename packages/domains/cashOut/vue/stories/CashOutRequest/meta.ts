import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import { CashOutRequestElement } from '../../src';

export const cashOutRequestMeta: Meta<ElementProps<typeof CashOutRequestElement>> = {
    argTypes: {
        referenceForBeneficiary: { control: 'text' },
        transferDescription: { control: 'text' },
        onSubmit: enabledDisabledCallbackRadioControls('onSubmit'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
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
