import { SessionResponse } from './Session/types';
import type { CustomTranslations } from './Localization/types';
import { AnalyticsOptions } from './Analytics/types';
import { LangFile } from './Localization/types';
import { KeyOfRecord, WithReplacedUnderscoreOrDash } from '../utils/types';

type CreateUnionOfAvailableTranslations<T extends LangFile[] | undefined> = T extends NonNullable<T>
    ? Extract<WithReplacedUnderscoreOrDash<KeyOfRecord<T[number]>, '_', '-'>, string>
    : never;

export interface CoreOptions<T extends CoreOptions<T> = any> {
    /**
     * @internal
     */
    analytics?: AnalyticsOptions;

    availableTranslations?: LangFile[];
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
    locale?: T['availableTranslations'] extends NonNullable<T['availableTranslations']>
        ? CreateUnionOfAvailableTranslations<T['availableTranslations']> | 'en-US'
        : 'en-US' | undefined;

    onError?: (err: any) => any;
    onSessionCreate: () => Promise<SessionResponse>;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations;
}

export type DevEnvironment = 'test' | 'live' | 'beta';
