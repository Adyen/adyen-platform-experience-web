import type { AuthSession } from '../session/AuthSession';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { DevEnvironment, onErrorHandler, AnalyticsConfig } from '../types';
import type { I18n } from './Context/types';

export type { DevEnvironment, onErrorHandler, AnalyticsConfig, SessionObject, SessionRequest };

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
    session: AuthSession;
    getCdnConfig: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    update: (options: Partial<CoreOptions>) => Promise<CoreInstance>;
}
