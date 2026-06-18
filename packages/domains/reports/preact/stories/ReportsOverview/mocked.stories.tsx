import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { ReportsOverview } from '../../src';
import { ReportsOverviewMeta } from './meta';
import { http, HttpResponse } from 'msw';
import { REPORTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/reports';
import { REPORTS_ENDPOINTS } from '../../../mocks/endpoints';
import { CUSTOM_DATA_REPORTS, CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION } from '../../../fixtures/data/ReportsOverview';

const meta: Meta<ElementProps<typeof ReportsOverview>> = { ...ReportsOverviewMeta, title: 'Mocked/Reports/Reports Overview' };
const defaultArgs = { mockedApi: true } as const;

export const Default: ElementStory<typeof ReportsOverview> = {
    name: 'Default',
    args: defaultArgs,
};

export const DataCustomization: ElementStory<typeof ReportsOverview> = {
    name: 'Data customization',
    args: {
        ...defaultArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: { list: DATA_CUSTOMIZATION },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(REPORTS_ENDPOINTS.reports, () => {
                    return HttpResponse.json({ data: CUSTOM_DATA_REPORTS, _links: {} });
                }),
            ],
        },
    },
};

export const SingleBalanceAccount: ElementStory<typeof ReportsOverview> = {
    name: 'Single balance account',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<typeof ReportsOverview> = {
    name: 'Empty list',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<typeof ReportsOverview> = {
    name: 'Error - List',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const DownloadError: ElementStory<typeof ReportsOverview> = {
    name: 'Download error',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.downloadError },
    },
};

export default meta;
