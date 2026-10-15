import '../theme/styles';

export type {
    AnalyticsConfig,
    CoreInstance,
    CoreOptions,
    CustomTheme,
    DataGridAppearance,
    DensityMode,
    DevEnvironment,
    GlobalAppearance,
    OnErrorHandler,
    SessionObject,
    SessionRequest,
    ThemeMode,
    ThemeVariables,
    UIElementProps,
    WithDataGridAppearance,
} from './types';
export type { SupportedLocales } from '../Localization/types';

export * from './Context';
export * from './ConfigContext';

export { Core } from '../Core';
export { createRefreshContext, UIElement } from './UIElement';
export { default as UIElementProvider } from './UIElementProvider.vue';
export { ComponentAvailabilityGate } from './componentAvailability/ComponentAvailabilityGate';
export { ComponentShell } from './componentShell/ComponentShell';
export type { ComponentShellState } from './componentShell/ComponentShell';
export { hasDataGridAppearance, useShouldHideIllustrations, useShouldHideTitles, useCondensedDataGrid } from './customization';
export { ErrorMessageDisplay } from './ErrorMessageDisplay';
export * from './getErrorMessage';
