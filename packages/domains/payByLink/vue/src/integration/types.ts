import type { App } from 'vue';
import type { EndpointHttpCallables } from '@integration-components/core';
import type { PaymentLinkCreationProps, PaymentLinkDetailsProps, PaymentLinkSettingsProps, PaymentLinksOverviewProps } from '../../../domain/src';

export type PaymentLinksOverviewDomainProps = Omit<PaymentLinksOverviewProps, 'ref'>;
export type PaymentLinkCreationDomainProps = Omit<PaymentLinkCreationProps, 'ref'>;
export type PaymentLinkDetailsDomainProps = Omit<PaymentLinkDetailsProps, 'onError' | 'ref'>;
export type PaymentLinkSettingsDomainProps = Omit<PaymentLinkSettingsProps, 'onError' | 'ref'>;

export type PayByLinkI18n = Readonly<{
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: string, options?: Record<string, unknown>): string;
    locale?: string;
    timezone?: string;
}>;

export interface PayByLinkTranslations {
    configure(app: App): void;
    i18n: PayByLinkI18n;
    provideOverrides(): void;
}

export type PayByLinkEndpointName =
    | 'countries'
    | 'createPBLPaymentLink'
    | 'expirePayByLinkPaymentLink'
    | 'getPayByLinkConfiguration'
    | 'getPayByLinkPaymentLinkById'
    | 'getPayByLinkSettings'
    | 'getPayByLinkStores'
    | 'getPayByLinkTheme'
    | 'getPaymentLinks'
    | 'payByLinkFilters'
    | 'savePayByLinkSettings'
    | 'updatePayByLinkTheme';

export type PayByLinkEndpoints = {
    [Endpoint in PayByLinkEndpointName]: EndpointHttpCallables<Endpoint>;
};

export type PayByLinkRuntimeSnapshot = Readonly<{
    available?: boolean;
    endpoints: Partial<PayByLinkEndpoints>;
    refreshing: boolean;
}>;

export interface PayByLinkRuntime {
    getCdnConfig<T>(options: { fallback: T; name: string; subFolder: string }): Promise<T>;
    getCdnDataset<T>(options: { extension?: string; fallback?: T; name: string; subFolder?: string }): Promise<T>;
    getSnapshot(): PayByLinkRuntimeSnapshot;
    refresh(): void | Promise<void>;
    subscribe(listener: (snapshot: PayByLinkRuntimeSnapshot) => void): () => void;
}

export type PayByLinkDependencies = Readonly<{
    runtime: PayByLinkRuntime;
    translations: PayByLinkTranslations;
}>;

export type PayByLinkContextRuntime = PayByLinkRuntimeSnapshot & Pick<PayByLinkRuntime, 'getCdnConfig' | 'getCdnDataset' | 'refresh'>;

export type PayByLinkContextValue = Readonly<{
    i18n: PayByLinkI18n;
    provideTranslationOverrides(): void;
    runtime: PayByLinkContextRuntime;
}>;
