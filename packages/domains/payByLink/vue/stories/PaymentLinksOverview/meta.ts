import type { Meta } from '@storybook/vue3';
import type { PaymentLinksOverviewExternalProps } from '../../src';
import PaymentLinksOverviewElement from '../../src/PaymentLinksOverview/PaymentLinksOverviewElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

export const PaymentLinksOverviewMeta: Meta<ElementProps<PaymentLinksOverviewExternalProps>> = {
    title: 'Components/Pay by Link/Payment Links Overview',
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
        component: PaymentLinksOverviewElement,
        allowLimitSelection: true,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
