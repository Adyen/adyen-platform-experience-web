import type { App } from 'vue';
import type { ReportsOverviewProps, ReportsTranslationKey } from '../../../domain/src';
import type { IBalanceAccountBase, IReport } from '@integration-components/types';

export type ReportsOverviewDomainProps = Omit<ReportsOverviewProps, 'ref'>;

export type ReportsTranslationOptions = Readonly<{
    count?: number;
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown);
}>;

export interface ReportsI18n {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: ReportsTranslationKey, options?: ReportsTranslationOptions): string;
}

export interface ReportsOverviewTranslations {
    configure(app: App): void;
    i18n: ReportsI18n;
    provideOverrides(): void;
}

export type ReportsOverviewRuntimeSnapshot = Readonly<{
    available?: boolean;
    refreshing: boolean;
}>;

export type ReportsBalanceAccountsSnapshot = Readonly<{
    accounts?: readonly IBalanceAccountBase[];
    error?: Error;
    loading: boolean;
}>;

export interface ReportsBalanceAccounts {
    getSnapshot(): ReportsBalanceAccountsSnapshot;
    subscribe(listener: (snapshot: ReportsBalanceAccountsSnapshot) => void): () => void;
}

export type ReportsListRequest = Readonly<{
    balanceAccountId: string;
    createdSince: string;
    createdUntil: string;
    cursor?: string;
    limit: number;
    signal: AbortSignal;
}>;

export type ReportsDownloadRequest = Readonly<{
    balanceAccountId: string;
    createdAt: string;
    type: string;
}>;

export type ReportsDownload = Readonly<{
    blob: Blob;
    filename?: string;
}>;

export interface ReportsOverviewRuntime {
    downloadReport(request: ReportsDownloadRequest): Promise<ReportsDownload | undefined>;
    getReports(request: ReportsListRequest): Promise<ReportsListResponse>;
    getSnapshot(): ReportsOverviewRuntimeSnapshot;
    refresh(): void | Promise<void>;
    subscribe(listener: (snapshot: ReportsOverviewRuntimeSnapshot) => void): () => void;
}

export type ReportsOverviewDependencies = Readonly<{
    balanceAccounts: ReportsBalanceAccounts;
    runtime: ReportsOverviewRuntime;
    translations: ReportsOverviewTranslations;
}>;

type ReportsOverviewContextRuntime = ReportsOverviewRuntimeSnapshot & Pick<ReportsOverviewRuntime, 'downloadReport' | 'getReports' | 'refresh'>;

export type ReportsContextValue = Readonly<{
    balanceAccounts: ReportsBalanceAccountsSnapshot;
    i18n: ReportsI18n;
    provideTranslationOverrides(): void;
    runtime: ReportsOverviewContextRuntime;
}>;

export type { IBalanceAccountBase };

/**
 * Shape of the /v1/reports list response as consumed by useReportsList.
 * Mirrors `components['schemas']['ReportsListResponseDTO']` but kept local
 * to avoid pulling the OpenAPI alias across the boundary.
 */
export interface ReportsListResponse {
    data?: IReport[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}
