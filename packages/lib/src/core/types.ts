import { SessionResponse } from './Session/types';
import type { CustomTranslations } from './Localization/types';
import { AnalyticsOptions } from './Analytics/types';
import { LangFile } from './Localization/types';
import { ReplaceUnderscoreOrDash } from '../utils/types';
import Session from './Session';

export type DevEnvironment = 'test' | 'live' | 'beta';

type ExtractKeys<T> = T extends any ? keyof T : never;

type CreateUnionOfAvailableTranslations<T extends LangFile[] | undefined> = T extends NonNullable<T>
    ? Extract<ReplaceUnderscoreOrDash<ExtractKeys<T[number]>, '_', '-'>, string>
    : never;

export interface CoreOptions<T extends CoreOptions<T> = any> {
    session?: Session;
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: DevEnvironment;

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
     * The shopper's country code. A valid value is an ISO two-character country code (e.g. 'NL').
     */
    countryCode?: string;

    availableTranslations?: LangFile[];

    onSessionCreate: SessionRequest;

    onError?: (e: any) => any;

    /**
     * @internal
     * */

    analytics?: AnalyticsOptions;

    timezone?: Intl.DateTimeFormatOptions['timeZone'];

    sessionSetupError?: boolean;
}

export type SessionRequest = () => Promise<SessionResponse>;
