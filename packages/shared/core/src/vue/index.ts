import '../theme/styles';

export type {
    AnalyticsConfig,
    Appearance,
    ComponentAppearance,
    ComponentDensity,
    CoreInstance,
    CoreOptions,
    CustomTheme,
    DensityMode,
    DevEnvironment,
    GlobalAppearance,
    onErrorHandler,
    SessionObject,
    SessionRequest,
    ThemeMode,
    ThemeVariables,
    UIElementProps,
} from './types';
export type { SupportedLocales } from '../Localization/types';

export * from './Context';
export * from './ConfigContext';

export { Core } from '../Core';
export { createRefreshContext, UIElement } from './UIElement';
export { default as UIElementProvider } from './UIElementProvider.vue';
export { resolveAppearance } from './customization';
