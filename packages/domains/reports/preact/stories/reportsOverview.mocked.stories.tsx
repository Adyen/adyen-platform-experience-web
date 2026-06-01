import { Meta } from '@storybook/preact';
import { CUSTOM_URL_EXAMPLE, ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { ReportsOverview } from '@integration-components/reports/publish';
import type { IReport } from '@integration-components/types';
import { ReportsOverviewMeta } from './reportsOverview.meta';
import { http, HttpResponse } from 'msw';
import { REPORTS } from '../../mocks/mock-data/reports';
import { REPORTS_OVERVIEW_HANDLERS } from '../../mocks/mock-server/reports';
import { REPORTS_ENDPOINTS } from '../../mocks/endpoints';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsOverviewMeta, title: 'Mocked/Reports/Reports Overview' };
const DEFAULT_STORY_ARGS = { mockedApi: true } as const;
const DEFAULT_REPORTS = REPORTS['BA32272223222B5CTDQPM6W2H'];
const getCustomReportsData = async (data: IReport[]) => {
    return data.map(report => {
        return {
            ...report,
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
        } as const;
    });
};

const CUSTOM_COLUMNS_MOCK_HANDLER = {
    handlers: [
        http.get(REPORTS_ENDPOINTS.reports, () => {
            return HttpResponse.json({
                data: [
                    { ...DEFAULT_REPORTS?.[0], createdAt: Date.now() },
                    { ...DEFAULT_REPORTS?.[4], createdAt: Date.now() },
                    { ...DEFAULT_REPORTS?.[6], createdAt: Date.now() },
                    { ...DEFAULT_REPORTS?.[8], createdAt: Date.now() },
                    { ...DEFAULT_REPORTS?.[10], createdAt: Date.now() },
                ],
                _links: {},
            });
        }),
    ],
};

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: DEFAULT_STORY_ARGS,
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
        ...DEFAULT_STORY_ARGS,
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

export const SingleBalanceAccount: ElementStory<typeof ReportsOverview> = {
    name: 'Single balance account',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<typeof ReportsOverview> = {
    name: 'Empty list',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof ReportsOverview> = {
    name: 'Error - List',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const DownloadError: ElementStory<typeof ReportsOverview> = {
    name: 'Download error',
    args: DEFAULT_STORY_ARGS,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.downloadError },
    },
};

export default meta;
