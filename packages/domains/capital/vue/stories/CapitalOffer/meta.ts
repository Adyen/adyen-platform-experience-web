import type { Meta } from '@storybook/vue3';
import type { CapitalOfferExternalProps } from '../../src';
import CapitalOfferElement from '../../src/CapitalOffer/CapitalOfferElement';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { action } from 'storybook/actions';

export const capitalOfferMeta: Meta<ElementProps<CapitalOfferExternalProps>> = {
    title: 'Components/Capital/Capital Offer',
    argTypes: {
        hideTitle: { control: 'boolean' },
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onFundsRequest: enabledDisabledCallbackRadioControls('onFundsRequest'),
        onOfferDismiss: enabledDisabledCallbackRadioControls('onOfferDismiss'),
        onOfferSelect: enabledDisabledCallbackRadioControls('onOfferSelect'),
    },
    args: {
        component: CapitalOfferElement,
        compact: true,
        onFundsRequest: action('onFundsRequest'),
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
