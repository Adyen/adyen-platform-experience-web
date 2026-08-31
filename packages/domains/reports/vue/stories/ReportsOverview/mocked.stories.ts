import type { Meta } from '@storybook/vue3';
import { ReportsOverviewMeta } from './meta';
import { getWorker } from 'msw-storybook-addon';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import { createDownloadReportHandler, REPORTS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/reports';
import { CUSTOM_TRANSLATIONS, DATA_CUSTOMIZATION, getCustomDataReports } from '../../../fixtures/data/ReportsOverview';
import { REPORTS_ENDPOINTS } from '../../../mocks/endpoints';
import { http, HttpResponse } from 'msw';
import type { ReportsOverviewDomainProps } from '../../src/definitions';

type ReportsOverviewStoryArgs = ReportsOverviewDomainProps & { enforceDownloadDelay?: boolean };

const meta: Meta<ElementProps<ReportsOverviewStoryArgs>> = {
    ...ReportsOverviewMeta,
    title: 'Mocked/Reports/Reports Overview',
    argTypes: {
        enforceDownloadDelay: {
            table: { disable: true },
        },
    },
    loaders: [
        context => {
            const enforceDownloadDelay = context.args.enforceDownloadDelay;
            if (enforceDownloadDelay) getWorker().use(createDownloadReportHandler({ enforceDownloadDelay }));
        },
    ],
};

const defaultArgs = { mockedApi: true } as const;

export const Default: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Default',
    args: defaultArgs,
};

export const CustomTranslations: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Custom translations',
    args: {
        ...defaultArgs,
        coreOptions: {
            locale: 'fi-FI',
            translations: {
                'fi-FI': {
                    'reports.overview.generateInfo': 'Mukautettu raporttikuvaus',
                    'reports.overview.title': 'Mukautetut raportit',
                },
            },
        },
    },
};

export const InvalidCustomTranslations: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Invalid custom translations',
    args: {
        ...defaultArgs,
        coreOptions: {
            locale: 'fi-FI',
            translations: {
                'fi-FI': {
                    'reports.overview.title': 'Invalid title %{unexpected}',
                },
            },
        },
    },
};

export const DataCustomization: ElementStory<ReportsOverviewDomainProps> = {
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

export const SingleBalanceAccount: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Single balance account',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const EmptyList: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Empty list',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Error - List',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.errorList },
    },
};

export const OverviewRoleNotAssigned: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Error - Role not assigned',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.permissionError },
    },
};

export const DownloadError: ElementStory<ReportsOverviewDomainProps> = {
    name: 'Download error',
    args: defaultArgs,
    parameters: {
        msw: { ...REPORTS_OVERVIEW_HANDLERS.downloadError },
    },
};

export default meta;
