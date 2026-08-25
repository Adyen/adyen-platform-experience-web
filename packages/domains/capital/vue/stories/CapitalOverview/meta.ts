import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import type { Meta } from '@storybook/vue3';
import CapitalOverviewElement from '../../src/CapitalOverview/CapitalOverviewElement';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverviewElement>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferOptionsRequest: enabledDisabledCallbackRadioControls('onOfferOptionsRequest'),
        skipPreQualifiedIntro: { type: 'boolean' },
    },
    args: {
        component: CapitalOverviewElement,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
