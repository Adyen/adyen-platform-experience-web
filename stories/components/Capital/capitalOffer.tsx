import { Meta } from '@storybook/preact';
import { legaEntityDecorator } from '../../mocked/utils/setupRequestConfig';
import { EMPTY_SETUP_LEGAL_ENTITY_OBJECT } from '../../utils/constants';
import { ElementProps, SetupControls } from '../../utils/types';
import { CapitalOffer } from '../../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { enabledDisabledCallbackRadioControls } from '../../utils/controls';
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
        onFundsRequest: action('onRequestFunds'),
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
