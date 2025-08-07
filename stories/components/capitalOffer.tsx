import { Meta } from '@storybook/preact';
import { legaEntityDecorator } from '../mocked/utils/setupRequestConfig';
import { EMPTY_SETUP_LEGAL_ENTITY_OBJECT } from '../utils/constants';
import { ElementProps, SetupControls } from '../utils/types';
import { CapitalOffer } from '../../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    args: {
        component: CapitalOffer,
        onFundsRequest: action('onRequestFunds'),
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
