import '@adyen/bento-design-tokens/dist/css/bento/variables.css';
import '@integration-components/style/vue-theme.scss';

export type {
    CoreOptions,
    CoreInstance,
    DevEnvironment,
    onErrorHandler,
    AnalyticsConfig,
    SessionObject,
    SessionRequest,
    ThemeMode,
    ThemeOptions,
    ThemeVariables,
} from './types';
export type { SupportedLocales } from '../Localization/types';

export * from './Context';
export * from './ConfigContext';

export { Core } from './Core';
export { createRefreshContext, UIElement } from './UIElement';
export { default as UIElementProvider } from './UIElementProvider.vue';
