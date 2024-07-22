import type { SessionRequest } from './Auth';
import type { CustomTranslations as Translations, LangFile } from './Localization/types';
import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';
import AdyenPlatformExperienceError from './Errors/AdyenPlatformExperienceError';

type CreateLocalesUnionFromAvailableTranslations<T extends LangFile[]> = T extends T
    ? Extract<WithReplacedUnderscoreOrDash<KeyOfRecord<T[number]>, '_', '-'>, string> | 'en-US'
    : never;

type CreateLocalesUnionFromCustomTranslations<T extends Translations> = Extract<KeyOfRecord<T extends Translations ? T : {}>, string>;

interface _CoreOptions<AvailableTranslations extends LangFile[] = [], CustomTranslations extends Translations = {}> {
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
        | (CustomTranslations extends CustomTranslations ? CreateLocalesUnionFromCustomTranslations<CustomTranslations> : never);

    onError?: onErrorHandler;
    onSessionCreate: SessionRequest;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations extends Translations ? CustomTranslations : Translations;
}

export interface CoreOptions<AvailableTranslations extends LangFile[] = [], CustomTranslations extends {} = {}>
    extends _CoreOptions<AvailableTranslations, CustomTranslations extends Translations ? CustomTranslations : unknown> {}

export type DevEnvironment = 'test' | 'live' | 'beta';

export type onErrorHandler = (error: Error) => any;
