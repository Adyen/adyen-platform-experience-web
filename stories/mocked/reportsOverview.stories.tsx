import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { ReportsOverview } from '../../src';
import { ReportsOverviewMeta } from '../components/reportsOverview';
import { getCustomReportsData } from './utils/customDataRequest';
import { http, HttpResponse } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { REPORTS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsOverviewMeta, title: 'Mocked/Reports/Reports Overview' };

const CUSTOM_COLUMNS_MOCK_HANDLER = {
    handlers: [
        http.get(endpoints().reports, () => {
            return HttpResponse.json({
                data: [
                    { ...REPORTS['BA32272223222B5CTDQPM6W2H']?.[0], createdAt: Date.now() },
                    { ...REPORTS['BA32272223222B5CTDQPM6W2H']?.[4], createdAt: Date.now() },
                    { ...REPORTS['BA32272223222B5CTDQPM6W2H']?.[6], createdAt: Date.now() },
                    { ...REPORTS['BA32272223222B5CTDQPM6W2H']?.[8], createdAt: Date.now() },
                    { ...REPORTS['BA32272223222B5CTDQPM6W2H']?.[10], createdAt: Date.now() },
                ],
                _links: {},
            });
        }),
    ],
};

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const DataCustomization: ElementStory<typeof ReportsOverview> = {
    name: 'Data customization',
    args: {
        coreOptions: {
            translations: {
                en_US: {
                    _summary: 'Summary',
                    _sendEmail: 'Action',
                },
            },
        },
        mockedApi: true,
        dataCustomization: {
            list: {
                fields: [
                    { key: 'createdAt' },
                    { key: 'reportType', visibility: 'hidden' },
                    { key: '_summary' },
                    { key: '_sendEmail', align: 'right' },
                    { key: 'reportFile', flex: 0.8 },
                ],
                onDataRetrieve: data => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(getCustomReportsData(data));
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
