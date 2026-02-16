import type { SessionRequest } from './ConfigContext';
import type { CustomTranslations as Translations, TranslationSourceRecord } from '../translations';
import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';
import { FALLBACK_LOCALE } from './Localization/constants/localization';
import { SupportedLocales } from './Localization/types';

type CreateLocalesUnionFromAvailableTranslations<T extends TranslationSourceRecord[]> = T extends T
    ? Extract<WithReplacedUnderscoreOrDash<KeyOfRecord<T[number]>, '_', '-'>, string> | typeof FALLBACK_LOCALE
    : never;

type CreateLocalesUnionFromCustomTranslations<T extends Translations> = Extract<KeyOfRecord<T extends Translations ? T : {}>, string>;

interface _CoreOptions<AvailableTranslations extends TranslationSourceRecord[] = [], CustomTranslations extends Translations = {}> {
    // TODO - Remove this prop on v2
    availableTranslations?: AvailableTranslations;

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
        | (AvailableTranslations extends AvailableTranslations ? CreateLocalesUnionFromAvailableTranslations<AvailableTranslations> : never)
        | (CustomTranslations extends CustomTranslations ? CreateLocalesUnionFromCustomTranslations<CustomTranslations> : never)
        | SupportedLocales;

    onError?: onErrorHandler;
    onSessionCreate: SessionRequest;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations extends Translations ? CustomTranslations : Translations;

    analytics?: AnalyticsConfig;

    theme?: 'dark' | 'light';

    /**
     * @internal
     */
    loadingContext?: string;
}

export interface CoreOptions<AvailableTranslations extends TranslationSourceRecord[] = [], CustomTranslations extends {} = {}>
    extends _CoreOptions<AvailableTranslations, CustomTranslations extends Translations ? CustomTranslations : unknown> {}

export type DevEnvironment = 'test' | 'live' | 'beta';

export type onErrorHandler = (error: Error) => any;
export type AnalyticsConfig = {
    enabled?: boolean;
};
