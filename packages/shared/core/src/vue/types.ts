import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { AnalyticsConfig, CoreOptions as BaseCoreOptions, DevEnvironment, onErrorHandler } from '../types';
import type { I18n } from './Context/types';
import type { ThemeProps } from '@adyen/adyen-shared-web';

export type { DevEnvironment, onErrorHandler, AnalyticsConfig, SessionObject, SessionRequest };

export type ThemeMode = 'dark' | 'light';
export type ThemeVariables = Omit<ThemeProps, 'dark'>;

export interface CustomTheme {
    light?: ThemeVariables;
    dark?: ThemeVariables;
}

export type CustomThemes = CustomTheme;

export interface CoreOptions extends BaseCoreOptions {
    balanceAccountId?: string;
    themeMode?: ThemeMode;
    customTheme?: CustomTheme;
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
    update: (options: Partial<CoreOptions>) => Promise<CoreInstance>;
}
