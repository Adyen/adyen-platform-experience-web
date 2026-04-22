import { Meta } from '@storybook/preact';
import { legaEntityDecorator } from '../mocked/utils/setupRequestConfig';
import { EMPTY_SETUP_LEGAL_ENTITY_OBJECT } from '@integration-components/testing/storybook-helpers';
import { ElementProps, SetupControls } from '@integration-components/testing/storybook-helpers';
import { CapitalOverview } from '../../src';
import { enabledDisabledCallbackRadioControls } from '@integration-components/testing/storybook-helpers';

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

export const CapitalOverviewWithSetupMeta: Meta<ElementProps<typeof CapitalOverview> & SetupControls> = {
    ...CapitalOverviewMeta,
    argTypes: {
        ...CapitalOverviewMeta.argTypes,
        legalEntity: {
            control: { type: 'object' },
            table: { category: 'Setup Config' },
        },
    },
    args: {
        ...CapitalOverviewMeta.args,
        legalEntity: EMPTY_SETUP_LEGAL_ENTITY_OBJECT,
    },
    decorators: [legaEntityDecorator],
};
