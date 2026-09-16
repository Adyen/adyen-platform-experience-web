import type { SessionRequest } from './ConfigContext.types';
import type { CustomTranslations as Translations } from './translations';
import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '@integration-components/utils/types';
import { SupportedLocales } from './Localization/types';
import type { Appearance } from '@integration-components/types';

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

    appearance?: Appearance;

    analytics?: AnalyticsConfig;

    /**
     * @internal
     */
    loadingContext?: string;
}

export type CoreOptions<CustomTranslations extends object = Record<never, never>> = _CoreOptions<
    CustomTranslations extends Translations ? CustomTranslations : Record<never, never>
>;

export type DevEnvironment = 'test' | 'live' | 'beta';

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
