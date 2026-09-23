import type { SessionRequest } from './ConfigContext.types';
import type { CustomTranslations as Translations } from './translations';
import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '@integration-components/utils/types';
import { SupportedLocales } from './Localization/types';
import type { ThemeProps } from '@adyen/adyen-shared-web';
import type { GlobalAppearance } from '@integration-components/types';

type CreateLocalesUnionFromCustomTranslations<T extends Translations> = Extract<
    WithReplacedUnderscoreOrDash<KeyOfRecord<T extends Translations ? T : Record<never, never>>, '_', '-'>,
    string
>;

interface _CoreOptions<CustomTranslations extends Translations = Record<never, never>> {
    /**
     * Core-level balance account config
     */
    // [TODO]: Expose when expected behavior has been decided
    // balanceAccountId?: string;

    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: DevEnvironment;

    /**
     * This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components | Localization}.
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.
     * @defaultValue 'en-US'
     */
    locale?:
        | (CustomTranslations extends CustomTranslations ? CreateLocalesUnionFromCustomTranslations<CustomTranslations> : never)
        | SupportedLocales;

    onError?: onErrorHandler;
    onSessionCreate: SessionRequest;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations extends Translations ? CustomTranslations : Translations;

    appearance?: GlobalAppearance;

    analytics?: AnalyticsConfig;

    /**
     * Theme mode for this Core instance. The mode is applied to each component mount target.
     *
     * Bento content teleported outside a mount target uses the document-level default theme
     * because Bento does not currently expose a per-Core teleport target.
     */
    themeMode?: ThemeMode;

    /**
     * Per-mode custom theme variables. Color values must use `#RGB` or `#RRGGBB`.
     * Invalid values throw while constructing or updating Core.
     */
    customTheme?: CustomTheme;

    /**
     * @internal
     */
    loadingContext?: string;
}

export type CoreOptions<CustomTranslations extends object = Record<never, never>> = _CoreOptions<
    CustomTranslations extends Translations ? CustomTranslations : Record<never, never>
>;

export type DevEnvironment = 'test' | 'live' | 'beta';

export type ThemeMode = 'dark' | 'light';
export type ThemeVariables = Omit<ThemeProps, 'dark'>;

export interface CustomTheme {
    light?: ThemeVariables;
    dark?: ThemeVariables;
}

export type onErrorHandler = (error: Error) => any;
export type AnalyticsConfig = {
    enabled?: boolean;
};

export interface ResolvedEnvironment {
    apiUrl: string;
    cdnTranslationsUrl: string;
    cdnAssetsUrl: string;
    cdnConfigUrl: string;
}
