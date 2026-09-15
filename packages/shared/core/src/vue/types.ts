import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { DevEnvironment, onErrorHandler, AnalyticsConfig } from '../types';
import type { DomainTranslationKey, I18n } from './Context/types';
import type { TranslationKey } from '../translations';
import type { SupportedLocales } from '../Localization/types';
import type Localization from '../Localization';

export type { DevEnvironment, onErrorHandler, AnalyticsConfig, SessionObject, SessionRequest };
export type DomainCustomTranslations = Record<string, { [key in TranslationKey | DomainTranslationKey]?: string }>;

export interface CoreOptions {
    environment?: DevEnvironment;
    locale?: SupportedLocales;
    onSessionCreate: SessionRequest;
    onError?: onErrorHandler;
    analytics?: AnalyticsConfig;
    translations?: DomainCustomTranslations;
    loadingContext?: string;
    balanceAccountId?: string;
}

export interface CoreInstance {
    options: CoreOptions;
    i18n: I18n;
    localization: Localization;
    bentoLocalization: Localization;
    loadingContext: string;
    analyticsEnabled: boolean;
    session: AuthSession;
    getCdnConfig: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getImageAsset: (props: AssetOptions) => string;
    update: (options: Partial<CoreOptions>) => Promise<CoreInstance>;
}
