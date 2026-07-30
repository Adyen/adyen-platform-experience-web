import { Meta } from '@storybook/preact';
import { http, HttpResponse } from 'msw';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayoutsOverview } from '../../src';
import { PayoutsOverviewMeta } from './meta';
import { PAYOUTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PAYOUTS_ENDPOINTS } from '../../../mocks/endpoints';
import { DEFAULT_PAYOUT_DETAILS } from '../../../fixtures/data/PayoutDetails';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION_DETAILS, DATA_CUSTOMIZATION_LIST } from '../../../fixtures/data/PayoutsOverview';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsOverviewMeta, title: 'Mocked/Payouts/Payouts Overview' };

export const Default: ElementStory<typeof PayoutsOverview> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const SingleBalanceAccount: ElementStory<typeof PayoutsOverview> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<typeof PayoutsOverview> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof PayoutsOverview> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const DataCustomization: ElementStory<typeof PayoutsOverview> = {
    name: 'Data customization',
    args: {
        mockedApi: true,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: {
            details: DATA_CUSTOMIZATION_DETAILS,
            list: DATA_CUSTOMIZATION_LIST,
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(PAYOUTS_ENDPOINTS.payouts, () => {
                    return HttpResponse.json({
                        data: [{ ...DEFAULT_PAYOUT_DETAILS.payout }],
                        _links: {},
                    });
                }),
            ],
        },
    },
};

export default meta;
