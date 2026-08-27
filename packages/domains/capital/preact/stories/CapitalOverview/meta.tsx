import { Meta } from '@storybook/preact';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { CapitalOverview } from '@integration-components/capital/preact';

export const CapitalOverviewMeta: Meta<ElementProps<typeof CapitalOverview>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferOptionsRequest: enabledDisabledCallbackRadioControls('onOfferOptionsRequest'),
        skipPreQualifiedIntro: { type: 'boolean' },
    },
    args: {
        component: CapitalOverview,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
