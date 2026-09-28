import type { AuthSession } from '../session/AuthSession';
import type { AssetOptions } from '../Assets/Assets';
import type { AnalyticsConfig, CoreOptions, CustomTheme, DevEnvironment, onErrorHandler, ThemeMode, ThemeVariables } from '../types';
import type { I18n } from './Context/types';
import type { Appearance, ComponentAppearance, DensityMode, GlobalAppearance } from '@integration-components/types';
import type Localization from '../Localization';

export type {
    AnalyticsConfig,
    Appearance,
    ComponentAppearance,
    CoreOptions,
    CustomTheme,
    DensityMode,
    DevEnvironment,
    GlobalAppearance,
    onErrorHandler,
    ThemeMode,
    ThemeVariables,
};
export type { SessionObject, SessionRequest } from '../ConfigContext.types';

export interface UIElementProps<Target extends string = never> {
    core: CoreInstance;
    appearance?: ComponentAppearance<Target>;
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
