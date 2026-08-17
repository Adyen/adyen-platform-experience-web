import { Meta } from '@storybook/preact';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { CapitalOffer } from '@integration-components/capital/preact';
import { action } from 'storybook/actions';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        hideTitle: { type: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferSelect: enabledDisabledCallbackRadioControls('onOfferSelect'),
    },
    args: {
        component: CapitalOffer,
        onFundsRequest: action('onFundsRequest'),
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
