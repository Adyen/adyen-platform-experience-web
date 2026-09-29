import '../theme/styles';

export type {
    AnalyticsConfig,
    Appearance,
    CoreInstance,
    CoreOptions,
    CustomTheme,
    DevEnvironment,
    OnErrorHandler,
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
