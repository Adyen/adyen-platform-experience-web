import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayoutsOverviewMeta } from '../components/payoutsOverview';
import { Meta } from '@storybook/preact';
import { getCustomPayoutsData } from './utils/customDataRequest';
import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { PAYOUTS_WITH_DETAILS } from '../../mocks/mock-data';
import { CUSTOM_URL_EXAMPLE } from '../utils/constants';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsOverviewMeta, title: 'Mocked/Payouts/Payouts Overview' };

export const Default: ElementStory<typeof PayoutsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

const CUSTOM_COLUMNS_MOCK_HANDLER = {
    handlers: [
        http.get(endpoints('mock').payouts, () => {
            return HttpResponse.json({
                data: [{ ...PAYOUTS_WITH_DETAILS[7]?.payout }],
                _links: {},
            });
        }),
    ],
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
            details: {
                fields: [{ key: '_summary' }, { key: '_country' }, { key: '_sendEmail' }],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve({
                                ...data,
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
                                    },
                                },
                            });
                        }, 200);
                    });
                },
            },
        },
    },
    parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },
};

export default meta;
