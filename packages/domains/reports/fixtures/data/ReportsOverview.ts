import type { ReportsListCustomization } from '@integration-components/reports/domain';
import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import { sleep } from '@integration-components/testing/fixtures/utils';
import { REPORTS } from '../../mocks/mock-data/reports';

const DEFAULT_REPORTS = REPORTS['BA32272223222B5CTDQPM6W2H']!;

export const getCustomDataReports = () => [
    { ...DEFAULT_REPORTS?.[0], createdAt: Date.now() },
    { ...DEFAULT_REPORTS?.[4], createdAt: Date.now() },
    { ...DEFAULT_REPORTS?.[6], createdAt: Date.now() },
    { ...DEFAULT_REPORTS?.[8], createdAt: Date.now() },
    { ...DEFAULT_REPORTS?.[10], createdAt: Date.now() },
];

export const CUSTOM_TRANSLATIONS = {
    'reports.overview.list.fields._sendEmail': 'Action',
    'reports.overview.list.fields._summary': 'Summary',
};

export const DATA_CUSTOMIZATION: ReportsListCustomization = {
    fields: [
        { key: 'createdAt' },
        { key: 'reportType', visibility: 'hidden' },
        { key: '_summary' },
        { key: '_sendEmail', align: 'right' },
        { key: 'reportFile', flex: 0.8 },
    ],

    onDataRetrieve: async data => {
        await sleep(200);
        return data.map(
            report =>
                ({
                    ...report,
                    _sendEmail: {
                        type: 'button',
                        value: 'Send email',
                        config: {
                            action: () => console.log('Action'),
                        },
                    },
                    _summary: {
                        type: 'link',
                        value: 'Summary',
                        config: {
                            href: CUSTOM_URL_EXAMPLE,
                        },
                    },
                }) as const
        );
    },
};
