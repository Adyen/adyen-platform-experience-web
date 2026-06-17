import { Meta } from '@storybook/preact';
import { legaEntityDecorator } from '../utils/setupRequestConfig';
import {
    ElementProps,
    EMPTY_SETUP_LEGAL_ENTITY_OBJECT,
    enabledDisabledCallbackRadioControls,
    SetupControls,
} from '@integration-components/testing/storybook-helpers';
import { CapitalOffer } from '../../src';
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

export const capitalOfferWithSetupMeta: Meta<ElementProps<typeof CapitalOffer> & SetupControls> = {
    ...capitalOfferMeta,
    argTypes: {
        ...capitalOfferMeta.argTypes,
        legalEntity: {
            control: { type: 'object' },
            table: { category: 'Setup Config' },
        },
    },
    args: {
        ...capitalOfferMeta.args,
        legalEntity: EMPTY_SETUP_LEGAL_ENTITY_OBJECT,
    },
    decorators: [legaEntityDecorator],
};
