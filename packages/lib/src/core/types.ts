import { SessionResponse } from './Session/types';
import type { CustomTranslations } from './Localization/types';
import { AnalyticsOptions } from './Analytics/types';
import { LangFile } from './Localization/types';
import { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';

type CreateUnionOfAvailableTranslations<T extends LangFile[]> = T extends T
    ? Extract<WithReplacedUnderscoreOrDash<KeyOfRecord<T[number]>, '_', '-'>, string> | 'en-US'
    : never;

export interface CoreOptions<AvailableTranslations extends LangFile[]> {
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
    locale?: AvailableTranslations extends AvailableTranslations ? CreateUnionOfAvailableTranslations<AvailableTranslations> : never;

    onError?: (err: any) => any;
    onSessionCreate: () => Promise<SessionResponse>;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations;
}

export type DevEnvironment = 'test' | 'live' | 'beta';
