import type { App } from 'vue';
import type { IAmount, IBalance, IBalanceAccountBase, ITransactionCategory, ITransactionStatus } from '@integration-components/types';
import type { EndpointData } from '@integration-components/types/api/endpoints';
import type {
    TransactionDetailsCustomization,
    TransactionDetailsProps,
    TransactionsListCustomization,
    TransactionsTranslationKey,
} from '../../../domain/src';
import type { TransactionsOverviewEventCallbacks } from '../events';

export interface TransactionsFilters {
    balanceAccountId?: string;
    categories: readonly ITransactionCategory[];
    statuses: readonly ITransactionStatus[];
    currencies: readonly IAmount['currency'][];
    createdSince: string;
    createdUntil: string;
    paymentPspReference?: string;
}

export interface TransactionsOverviewDomainProps {
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => unknown;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => unknown;
    dataCustomization?: {
        list?: TransactionsListCustomization;
        details?: TransactionDetailsCustomization;
    };
}

export type TransactionDetailsDomainProps = Omit<TransactionDetailsProps, 'ref'>;
export type TransactionDetailsRenderMode = 'modal' | 'standalone';

export type TransactionsTranslationOptions = Readonly<{
    count?: number;
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown);
}>;

export interface TransactionsI18n {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: TransactionsTranslationKey, options?: TransactionsTranslationOptions): string;
    has(key: string, options?: TransactionsTranslationOptions): key is TransactionsTranslationKey;
    readonly locale: string;
    timezone?: string;
}

export interface TransactionsTranslations {
    configure(app: App): void;
    i18n: TransactionsI18n;
    provideOverrides(): void;
}

export type TransactionsRuntimeSnapshot = Readonly<{
    available?: boolean;
    canDownload: boolean;
    canGetBalances: boolean;
    canGetTotals: boolean;
    canRefund: boolean;
    refreshing: boolean;
}>;

export type TransactionsBalanceAccountsSnapshot = Readonly<{
    accounts?: readonly IBalanceAccountBase[];
    error?: Error;
    loading: boolean;
}>;

export interface TransactionsBalanceAccounts {
    getSnapshot(): TransactionsBalanceAccountsSnapshot;
    subscribe(listener: (snapshot: TransactionsBalanceAccountsSnapshot) => void): () => void;
}

export type TransactionsListRequest = TransactionsFilters &
    Readonly<{
        cursor?: string;
        limit: number;
        signal: AbortSignal;
        sortDirection: 'asc' | 'desc';
    }>;

export type TransactionsTotalsRequest = TransactionsFilters & Readonly<{ signal: AbortSignal }>;

export type TransactionRequest = Readonly<{
    signal: AbortSignal;
    transactionId: string;
}>;

export type BalancesRequest = Readonly<{
    balanceAccountId: string;
    signal: AbortSignal;
}>;

export type DownloadTransactionsRequest = TransactionsFilters &
    Readonly<{
        columns: string[];
        signal: AbortSignal;
        sortDirection: 'asc' | 'desc';
    }>;

export type InitiateRefundRequest = Readonly<{
    amount: Readonly<{ currency: string; value: number }>;
    refundReason: string;
    signal: AbortSignal;
    transactionId: string;
}>;

export interface TransactionsRuntime {
    downloadTransactions(request: DownloadTransactionsRequest): Promise<EndpointData<'downloadTransactions'>>;
    getBalances(request: BalancesRequest): Promise<readonly Readonly<IBalance>[]>;
    getSnapshot(): TransactionsRuntimeSnapshot;
    getTransaction(request: TransactionRequest): Promise<EndpointData<'getTransaction'>>;
    getTransactions(request: TransactionsListRequest): Promise<EndpointData<'getTransactions'>>;
    getTransactionsTotals(request: TransactionsTotalsRequest): Promise<EndpointData<'getTransactionTotals'>>;
    initiateRefund(request: InitiateRefundRequest): Promise<EndpointData<'initiateRefund'>>;
    refresh(): void | Promise<void>;
    subscribe(listener: (snapshot: TransactionsRuntimeSnapshot) => void): () => void;
}

export type TransactionsDependencies = Readonly<{
    balanceAccounts: TransactionsBalanceAccounts;
    callbacks?: TransactionsOverviewEventCallbacks;
    runtime: TransactionsRuntime;
    translations: TransactionsTranslations;
}>;

type TransactionsContextRuntime = TransactionsRuntimeSnapshot &
    Pick<
        TransactionsRuntime,
        'downloadTransactions' | 'getBalances' | 'getTransaction' | 'getTransactions' | 'getTransactionsTotals' | 'initiateRefund' | 'refresh'
    >;

export type TransactionsContextValue = Readonly<{
    balanceAccounts: TransactionsBalanceAccountsSnapshot;
    i18n: TransactionsI18n;
    provideTranslationOverrides(): void;
    runtime: TransactionsContextRuntime;
}>;
