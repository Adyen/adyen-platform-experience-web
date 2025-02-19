import { PayoutsOverview } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { PayoutsMeta } from '../components/payoutsOverview';
import { Meta } from '@storybook/preact';
import { getCustomPayoutsData } from './utils/customDataRequest';
import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { PAYOUTS_WITH_DETAILS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof PayoutsOverview>> = { ...PayoutsMeta, title: 'Mocked/Payouts Overview' };

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

export const CustomColumns: ElementStory<typeof PayoutsOverview> = {
    name: 'Custom Columns',
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
        columns: [
            { key: 'createdAt' },
            { key: 'fundsCapturedAmount' },
            { key: 'adjustmentAmount' },
            { key: '_summary' },
            { key: '_country', flex: 0.5 },
            { key: '_sendEmail', align: 'right' },
            { key: 'payoutAmount' },
        ],
        onDataRetrieved: data => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getCustomPayoutsData(data));
                }, 200);
            });
        },
    },
    parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },
};

export default meta;
