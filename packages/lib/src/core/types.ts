import type { SessionResponse } from './Session/types';
import type { AnalyticsOptions } from './Analytics/types';
import type { CustomTranslations as Translations, LangFile } from './Localization/types';
import type { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';

type CreateLocalesUnionFromAvailableTranslations<T extends LangFile[]> = T extends T
    ? Extract<WithReplacedUnderscoreOrDash<KeyOfRecord<T[number]>, '_', '-'>, string> | 'en-US'
    : never;

type CreateLocalesUnionFromCustomTranslations<T extends Translations> = Extract<KeyOfRecord<T extends Translations ? T : {}>, string>;

interface _CoreOptions<AvailableTranslations extends LangFile[] = [], CustomTranslations extends Translations = {}> {
    /**
     * @internal
     */
    analytics?: AnalyticsOptions;

    availableTranslations?: AvailableTranslations;
    balanceAccountId?: string;

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

    onError?: (err: any) => any;
    onSessionCreate: () => Promise<SessionResponse>;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations extends Translations ? CustomTranslations : Translations;
}

export interface CoreOptions<AvailableTranslations extends LangFile[] = [], CustomTranslations extends {} = {}>
    extends _CoreOptions<AvailableTranslations, CustomTranslations extends Translations ? CustomTranslations : unknown> {}

export type DevEnvironment = 'test' | 'live' | 'beta';
