import type { Meta } from '@storybook/vue3';
import { http, HttpResponse } from 'msw';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayoutsOverviewMeta } from './meta';
import type { PayoutsOverviewExternalProps } from '../../src';
import { PAYOUTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PAYOUTS_ENDPOINTS } from '../../../mocks/endpoints';
import { DEFAULT_PAYOUT_DETAILS } from '../../../fixtures/data/PayoutDetails';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION_DETAILS, DATA_CUSTOMIZATION_LIST } from '../../../fixtures/data/PayoutsOverview';

const meta: Meta<ElementProps<PayoutsOverviewExternalProps>> = {
    ...PayoutsOverviewMeta,
    title: 'Mocked/Payouts/Payouts Overview',
};

export const Default: ElementStory<PayoutsOverviewExternalProps> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const SingleBalanceAccount: ElementStory<PayoutsOverviewExternalProps> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<PayoutsOverviewExternalProps> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<PayoutsOverviewExternalProps> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const DataCustomization: ElementStory<PayoutsOverviewExternalProps> = {
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
