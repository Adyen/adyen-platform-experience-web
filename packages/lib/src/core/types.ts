import type { CustomTranslations } from './Localization/types';
import { AmountExtended } from '../types/shared';
import { AnalyticsOptions } from './Analytics/types';
import { LangFile } from './Localization/types';
import { ReplaceUnderscoreOrDash } from '../utils/types';

export type DevEnvironment = 'test' | 'live';

type ExtractKeys<T> = T extends any ? keyof T : never;

type CreateUnionOfAvailableTranslations<T extends LangFile[] | undefined> = T extends NonNullable<T>
    ? Extract<ReplaceUnderscoreOrDash<ExtractKeys<T[number]>, '_', '-'>, string>
    : never;

export interface CoreOptions<T extends CoreOptions<T> = any> {
    session?: any;
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: DevEnvironment;

    /**
     * A public key linked to your web service user, used for {@link https://docs.adyen.com/user-management/client-side-authentication | client-side authentication}.
     */
    clientKey?: string;

    sessionToken?: string;

    /**
     * The shopper's locale. This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components | Localization}.
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.
     * @defaultValue 'en-US'
     */
    locale?: T['availableTranslations'] extends NonNullable<T['availableTranslations']>
        ? CreateUnionOfAvailableTranslations<T['availableTranslations']> | 'en-US'
        : 'en-US' | undefined;

    /**
     * Custom translations and localizations
     * See {@link https://docs.adyen.com/checkout/components-web/localization-components | Localizing Components}
     */
    translations?: CustomTranslations;

    /**
     * Amount of the payment
     */
    amount?: AmountExtended;

    /**
     * Secondary amount of the payment - alternative currency & value converted according to rate
     */
    secondaryAmount?: AmountExtended;

    /**
     * The shopper's country code. A valid value is an ISO two-character country code (e.g. 'NL').
     */
    countryCode?: string;

    availableTranslations?: LangFile[];

    loadingContext?: string;

    onError?: (e: any) => any;

    /**
     * @internal
     * */

    analytics?: AnalyticsOptions;

    timezone?: Intl.DateTimeFormatOptions['timeZone'];

    onSessionCreate?: Session;

    error?: boolean;
}

export type Session = () => Promise<Response>;
