import type { Meta } from '@storybook/vue3';
import { http, HttpResponse } from 'msw';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayoutsOverviewMeta } from './meta';
import type { PayoutsOverviewDomainProps } from '../../src/definitions';
import { PAYOUTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PAYOUTS_ENDPOINTS } from '../../../mocks/endpoints';
import { DEFAULT_PAYOUT_DETAILS } from '../../../fixtures/data/PayoutDetails';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION_DETAILS, DATA_CUSTOMIZATION_LIST } from '../../../fixtures/data/PayoutsOverview';

const meta: Meta<ElementProps<PayoutsOverviewDomainProps>> = {
    ...PayoutsOverviewMeta,
    title: 'Mocked/Payouts/Payouts Overview',
};

export const Default: ElementStory<PayoutsOverviewDomainProps> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const SingleBalanceAccount: ElementStory<PayoutsOverviewDomainProps> = {
    name: 'Single balance account',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<PayoutsOverviewDomainProps> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<PayoutsOverviewDomainProps> = {
    name: 'Error - List',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const OverviewRoleNotAssigned: ElementStory<PayoutsOverviewDomainProps> = {
    name: 'Error - Role not assigned',
    args: { mockedApi: true },
    parameters: {
        msw: { ...PAYOUTS_OVERVIEW_HANDLERS.permissionError },
    },
};

export const DataCustomization: ElementStory<PayoutsOverviewDomainProps> = {
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
