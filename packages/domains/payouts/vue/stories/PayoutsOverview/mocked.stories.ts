import type { Meta } from '@storybook/vue3';
import { http, HttpResponse } from 'msw';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { IPayout } from '@integration-components/types';
import { PayoutsOverviewMeta } from './meta';
import PayoutsOverview from '../../src/PayoutsOverview/PayoutsOverviewWrapper.vue';
import { PAYOUTS_WITH_DETAILS } from '../../../mocks/mock-data/payouts';
import { PAYOUTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/payouts';
import { PAYOUTS_ENDPOINTS } from '../../../mocks/endpoints';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = {
    ...PayoutsOverviewMeta,
    title: 'Mocked/Payouts/Payouts Overview',
};

export default meta;

const getCustomPayoutsData = async (data: IPayout[]) => {
    return data.map(payouts => {
        return {
            ...payouts,
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
            _country: {
                type: 'icon',
                value: '',
                config: {
                    src: `https://flagicons.lipis.dev/flags/4x3/es.svg`,
                    alt: '',
                },
            },
        } as const;
    });
};

export const Default: ElementStory<typeof PayoutsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
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
        coreOptions: {
            translations: {
                en_US: {
                    _summary: 'Summary',
                    _sendEmail: 'Action',
                    _country: 'Country',
                },
            },
        },
        mockedApi: true,
        dataCustomization: {
            list: {
                fields: [
                    { key: 'adjustmentAmount', visibility: 'hidden' },
                    { key: '_summary' },
                    { key: '_country', flex: 0.5 },
                    { key: '_sendEmail', align: 'right' },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getCustomPayoutsData(data));
                        }, 200);
                    });
                },
            },
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(PAYOUTS_ENDPOINTS.payouts, () => {
                    return HttpResponse.json({
                        data: [{ ...PAYOUTS_WITH_DETAILS[0]?.payout }],
                        _links: {},
                    });
                }),
            ],
        },
    },
};
