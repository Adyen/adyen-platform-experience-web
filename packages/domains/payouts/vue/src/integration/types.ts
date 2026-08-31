import type { App } from 'vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { EndpointData } from '@integration-components/types/api/endpoints';
import type { PayoutDetailsProps, PayoutsOverviewProps, PayoutsTranslationKey } from '../../../domain/src';

export type PayoutsOverviewDomainProps = Omit<PayoutsOverviewProps, 'ref'>;
export type PayoutDetailsDomainProps = Omit<PayoutDetailsProps, 'ref'>;
export type PayoutDetailsRenderMode = 'modal' | 'standalone';

export type PayoutsTranslationOptions = Readonly<{
    count?: number;
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown);
}>;

export interface PayoutsI18n {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: PayoutsTranslationKey, options?: PayoutsTranslationOptions): string;
    has(key: string, options?: PayoutsTranslationOptions): key is PayoutsTranslationKey;
    readonly locale: string;
    timezone?: string;
}

export interface PayoutsTranslations {
    configure(app: App): void;
    i18n: PayoutsI18n;
    provideOverrides(): void;
}

export type PayoutsRuntimeSnapshot = Readonly<{
    available?: boolean;
    refreshing: boolean;
}>;

export type PayoutsBalanceAccountsSnapshot = Readonly<{
    accounts?: readonly IBalanceAccountBase[];
    error?: Error;
    loading: boolean;
}>;

export interface PayoutsBalanceAccounts {
    getSnapshot(): PayoutsBalanceAccountsSnapshot;
    subscribe(listener: (snapshot: PayoutsBalanceAccountsSnapshot) => void): () => void;
}

export type PayoutsListRequest = Readonly<{
    balanceAccountId: string;
    createdSince: string;
    createdUntil: string;
    cursor?: string;
    limit: number;
    signal: AbortSignal;
}>;

export type PayoutDetailsRequest = Readonly<{
    balanceAccountId: string;
    createdAt: string;
    signal: AbortSignal;
}>;

export interface PayoutsRuntime {
    getPayout(request: PayoutDetailsRequest): Promise<EndpointData<'getPayout'>>;
    getPayouts(request: PayoutsListRequest): Promise<EndpointData<'getPayouts'>>;
    getSnapshot(): PayoutsRuntimeSnapshot;
    refresh(): void | Promise<void>;
    subscribe(listener: (snapshot: PayoutsRuntimeSnapshot) => void): () => void;
}

export type PayoutsDependencies = Readonly<{
    balanceAccounts: PayoutsBalanceAccounts;
    runtime: PayoutsRuntime;
    translations: PayoutsTranslations;
}>;

type PayoutsContextRuntime = PayoutsRuntimeSnapshot & Pick<PayoutsRuntime, 'getPayout' | 'getPayouts' | 'refresh'>;

export type PayoutsContextValue = Readonly<{
    balanceAccounts: PayoutsBalanceAccountsSnapshot;
    i18n: PayoutsI18n;
    provideTranslationOverrides(): void;
    runtime: PayoutsContextRuntime;
}>;
