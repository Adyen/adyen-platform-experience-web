import type { I18n } from './Context/types';

export type DevEnvironment = 'test' | 'live' | 'beta';

export type onErrorHandler = (error: Error) => void;

export type AnalyticsConfig = {
    enabled?: boolean;
};

export type SessionRequest = () => Promise<{ id: string; token: string }>;

export interface CoreOptions {
    environment?: DevEnvironment;
    locale?: string;
    onSessionCreate: SessionRequest;
    onError?: onErrorHandler;
    analytics?: AnalyticsConfig;
    loadingContext?: string;
    balanceAccountId?: string;
}

export interface CoreInstance {
    options: CoreOptions;
    i18n: I18n;
    loadingContext: string;
    analyticsEnabled: boolean;
    session: {
        id: string;
        token: string;
    } | null;
    getCdnConfig: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    update: (options: Partial<CoreOptions>) => Promise<CoreInstance>;
}
