import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { ReportsOverview } from '../../src';
import { ReportsMeta } from '../components/reportsOverview';
import { getCustomReportsData } from './utils/customDataRequest';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsMeta, title: 'Mocked/Reports Overview' };

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

export const CustomColumns: ElementStory<typeof ReportsOverview> = {
    name: 'Custom Columns',
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
        columns: [
            { key: 'createdAt' },
            { key: 'reportType' },
            { key: '_summary' },
            { key: '_sendEmail', align: 'right' },
            { key: 'reportFile', flex: 0.8 },
        ],
        onDataRetrieved: data => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getCustomReportsData(data));
                }, 200);
            });
        },
    },
    /*parameters: {
        msw: CUSTOM_COLUMNS_MOCK_HANDLER,
    },*/
};

export default meta;
