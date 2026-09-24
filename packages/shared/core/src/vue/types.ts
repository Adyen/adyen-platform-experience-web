import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { AnalyticsConfig, CoreOptions, CustomTheme, DevEnvironment, onErrorHandler, ThemeMode, ThemeVariables } from '../types';
import type { I18n } from './Context/types';
import type { Appearance } from '@integration-components/types';
import type Localization from '../Localization';

export type { Appearance };
export type { CoreOptions, CustomTheme, DevEnvironment, onErrorHandler, AnalyticsConfig, ThemeMode, ThemeVariables };
export type { SessionObject, SessionRequest } from '../ConfigContext.types';

export interface UIElementProps {
    core: CoreInstance;
    appearance?: Appearance;
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
    registerThemeRoot: (root: Element) => void;
    unregisterThemeRoot: (root: Element) => void;
}
