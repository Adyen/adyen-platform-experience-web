import type { Meta } from '@storybook/vue3';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import PaymentLinksOverviewElement from '../../src/PaymentLinksOverview/PaymentLinksOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const paymentLinksOverviewMeta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    title: 'Components/Pay by Link/Payment Links Overview',
    argTypes: {
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        storeIds: { control: 'object' },
        pagination: { control: 'object' },
    },
    args: {
        component: PaymentLinksOverviewElement,
        pagination: { defaultLimit: 10, disableLimitSelection: false },
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
