import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { DevEnvironment, onErrorHandler, AnalyticsConfig } from '../types';
import type { I18n } from './Context/types';
import type { SupportedLocales } from '../Localization/types';
import type { DomainTranslationConnection, DomainTranslationInputs } from '../translation-contract';
import type { ManagedElement } from '../Core';

export type { DevEnvironment, onErrorHandler, AnalyticsConfig, SessionObject, SessionRequest };

export interface CoreOptions {
    environment?: DevEnvironment;
    locale?: SupportedLocales;
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
    getImageAsset: (props: AssetOptions) => string;
    getDomainTranslationInputs: <DomainKey extends string>(domain: string) => DomainTranslationInputs<DomainKey>;
    connectDomainTranslations: <DomainKey extends string>(domain: string, signal: AbortSignal) => DomainTranslationConnection<DomainKey>;
    registerComponent(component: ManagedElement): void;
    remove(component: ManagedElement): CoreInstance;
    update: (options: Partial<CoreOptions>) => Promise<CoreInstance>;
}
