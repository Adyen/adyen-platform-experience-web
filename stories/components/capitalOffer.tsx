import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';
import { CapitalOffer } from '../../src';

export const capitalOfferMeta: Meta<ElementProps<typeof CapitalOffer>> = {
    argTypes: {
        externalDynamicOffersConfig: { control: 'object' },
        hideTitle: { type: 'boolean' },
        onOfferSigned: enabledDisabledCallbackRadioControls('onOfferSigned'),
        balanceAccountId: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        externalDynamicOffersConfig: undefined,
        hideTitle: false,
        onOfferSigned: () => {},
        component: CapitalOffer,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
    decorators: [Story => <div style={{ margin: 'auto', maxWidth: 400, width: '100%' }}>{Story()}</div>],
};
