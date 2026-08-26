import type { Meta } from '@storybook/vue3';
import { ReportsOverviewMeta } from './meta';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { ReportsOverviewExternalProps } from '../../src';
import { REPORTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/reports';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, getCustomDataReports } from '../../../fixtures/data/ReportsOverview';
import { REPORTS_ENDPOINTS } from '../../../mocks/endpoints';
import { http, HttpResponse } from 'msw';

const meta: Meta<ElementProps<ReportsOverviewExternalProps>> = {
    ...ReportsOverviewMeta,
    title: 'Mocked/Reports/Reports Overview',
};

const defaultArgs = { mockedApi: true } as const;

export const Default: ElementStory<ReportsOverviewExternalProps> = {
    name: 'Default',
    args: defaultArgs,
};

export const DataCustomization: ElementStory<ReportsOverviewExternalProps> = {
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
                    return HttpResponse.json({ data: getCustomDataReports(), _links: {} });
                }),
            ],
        },
    },
};

export const SingleBalanceAccount: ElementStory<ReportsOverviewExternalProps> = {
    name: 'Single balance account',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<ReportsOverviewExternalProps> = {
    name: 'Empty list',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<ReportsOverviewExternalProps> = {
    name: 'Error - List',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const DownloadError: ElementStory<ReportsOverviewExternalProps> = {
    name: 'Download error',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.downloadError },
    },
};

export default meta;
