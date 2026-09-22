import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { SessionObject, SessionRequest } from '../ConfigContext.types';
import type { AnalyticsConfig, CoreOptions, CustomTheme, DevEnvironment, onErrorHandler, ThemeMode, ThemeVariables } from '../types';
import type { I18n } from './Context/types';
import type { Appearance } from '@integration-components/types';

export type {
    Appearance,
    CoreOptions,
    CustomTheme,
    DevEnvironment,
    onErrorHandler,
    AnalyticsConfig,
    SessionObject,
    SessionRequest,
    ThemeMode,
    ThemeVariables,
};

export interface UIElementProps {
    core: CoreInstance;
    appearance?: Appearance;
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
    registerThemeRoot: (root: Element) => void;
    unregisterThemeRoot: (root: Element) => void;
}
