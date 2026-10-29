import type { Meta } from '@storybook/vue3';
import type { CapitalOfferExternalProps } from '../../src';
import { CapitalOfferElement } from '../../src';
import { ElementProps, enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';
import { action } from 'storybook/actions';

export const CapitalOfferMeta: Meta<ElementProps<CapitalOfferExternalProps>> = {
    title: 'Components/Capital/Capital Offer',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        onSubmit: enabledDisabledCallbackRadioControls('onSubmit'),
        onDismiss: enabledDisabledCallbackRadioControls('onDismiss'),
    },
    args: {
        component: CapitalOfferElement,
        compact: true,
        onSubmit: action('onSubmit'),
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
