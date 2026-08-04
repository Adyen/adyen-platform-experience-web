import type { Meta } from '@storybook/vue3';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import PaymentLinksOverview from '../../src/PaymentLinksOverview/PaymentLinksOverviewWrapper.vue';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinksOverviewMeta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    title: 'Components/Pay by Link/Payment Links Overview',
    component: PaymentLinksOverview,
    argTypes: {
        onFiltersChanged: enabledDisabledCallbackRadioControls('onFiltersChanged', ['Passed', 'Not Passed']),
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { control: 'boolean' },
        showDetails: { control: 'boolean' },
        preferredLimit: { control: { type: 'number', min: 1, max: 100 } },
        allowLimitSelection: { control: 'boolean' },
    },
    args: {
        component: PaymentLinksOverview,
        allowLimitSelection: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
