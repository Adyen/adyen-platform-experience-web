import type { Meta } from '@storybook/vue3';
import { getWorker } from 'msw-storybook-addon';
import { transactionsOverviewMeta } from './meta';
import { ElementProps, ElementStory, type DelayedEndpoints, provisionDelayedEndpoints } from '@integration-components/testing/storybook-helpers';
import type { TransactionsOverviewExternalProps } from '../../src';
import { http, HttpResponse } from 'msw';
import { TRANSACTIONS_ENDPOINTS } from '../../../mocks/endpoints';
import { TRANSACTIONS_OVERVIEW_HANDLERS } from '../../../mocks/mock-server/transactions';
import {
    CUSTOM_TRANSLATIONS,
    DATA_CUSTOMIZATION_DETAILS,
    DATA_CUSTOMIZATION_DATA_GRID,
    getCustomDataTransactions,
} from '../../../fixtures/data/TransactionsOverview';
import { withDelay } from '@integration-components/testing/msw';

type TransactionsOverviewStoryArgs = TransactionsOverviewExternalProps & {
    delayedEndpoints?: DelayedEndpoints<typeof TRANSACTIONS_ENDPOINTS>;
};

const meta: Meta<ElementProps<TransactionsOverviewStoryArgs>> = {
    ...transactionsOverviewMeta,
    title: 'Mocked/Transactions/Transactions Overview',
    argTypes: {
        ...transactionsOverviewMeta.argTypes,
        delayedEndpoints: {
            control: false,
            table: { disable: true },
        },
    },
    loaders: [context => provisionDelayedEndpoints(getWorker(), TRANSACTIONS_ENDPOINTS, context.args.delayedEndpoints)],
};

const sharedArgs = { mockedApi: true } as const;

export const Default: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Default',
    args: sharedArgs,
};

export const Condensed: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Condensed',
    args: {
        ...sharedArgs,
        dataGridDensity: 'condensed',
    },
};

export const SingleBalanceAccount: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance account',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceAccount },
    },
};

export const SingleBalanceCurrency: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Single balance currency',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.singleBalanceCurrency },
    },
};

export const EmptyList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Empty list',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.emptyList },
    },
};

export const ErrorList: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - List',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorList },
    },
};

export const ErrorExport: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Export',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorExport },
    },
};

export const ErrorBalances: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Balances',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorBalances },
    },
};

export const ErrorTotals: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Error - Totals',
    args: sharedArgs,
    parameters: {
        msw: { ...TRANSACTIONS_OVERVIEW_HANDLERS.errorTotals },
    },
};

export const DataCustomization: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Data customization',
    args: {
        ...sharedArgs,
        coreOptions: {
            translations: { en_US: CUSTOM_TRANSLATIONS },
        },
        dataCustomization: {
            details: DATA_CUSTOMIZATION_DETAILS,
            dataGrid: DATA_CUSTOMIZATION_DATA_GRID,
        },
    },
    parameters: {
        msw: {
            handlers: [
                http.get(
                    TRANSACTIONS_ENDPOINTS.transactions,
                    withDelay(() => {
                        return HttpResponse.json({ data: getCustomDataTransactions(), _links: {} });
                    })
                ),
            ],
        },
    },
};

export default meta;
