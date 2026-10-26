import { Core, CoreOptions } from '@integration-components/core';
import '@integration-components/style';
import './global';

export type {
    AnalyticsConfig,
    CoreOptions,
    CustomTheme,
    CustomTranslations,
    DevEnvironment,
    OnErrorHandler as ErrorHandler,
    SessionObject,
    SessionRequest,
    ThemeMode,
    ThemeVariables,
    TranslationKey,
} from '@integration-components/core';

export type { SupportedLocales } from '@integration-components/core/Localization/types';
export { AdyenPlatformExperienceError } from '@integration-components/core';

export async function AdyenPlatformExperience<CustomTranslations extends object = Record<never, never>>(props: CoreOptions<CustomTranslations>) {
    const core = new Core(props);
    return await core.initialize();
}
