import type { Meta, StoryObj } from '@storybook/vue3';
import { ReportsOverviewMeta, type ReportsOverviewStoryArgs } from '../components/reportsOverview';
import { CUSTOM_URL_EXAMPLE, ElementStory } from '@integration-components/testing/storybook-helpers';
import { ReportsOverview } from '../../../publish/src';
import type { IReport } from '@integration-components/types';
import { REPORTS } from '../../../mocks/mock-data/reports';
import { REPORTS_ENDPOINTS } from '../../../mocks/endpoints';
import { http, HttpResponse } from 'msw';

const meta: Meta<ReportsOverviewStoryArgs> = {
    ...ReportsOverviewMeta,
    title: 'Mocked/Reports/Reports Overview',
};

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

const DEFAULT_REPORTS = REPORTS['BA32272223222B5CTDQPM6W2H'];

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

export default meta;
const DEFAULT_STORY_ARGS = { mockedApi: true } as const;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
