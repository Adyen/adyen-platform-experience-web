import { CustomTranslations, Locales } from '../language/types';
import { AmountExtended } from '../types';
import { AnalyticsOptions } from './Analytics/types';
import { RiskModuleOptions } from './RiskModule/RiskModule';

export interface CoreOptions {
    session?: any;
    /**
     * Use test. When you're ready to accept live payments, change the value to one of our {@link https://docs.adyen.com/checkout/drop-in-web#testing-your-integration | live environments}.
     */
    environment?: 'test' | 'live' | 'live-us' | 'live-au' | 'live-apse' | 'live-in' | string;

    /**
     * A public key linked to your web service user, used for {@link https://docs.adyen.com/user-management/client-side-authentication | client-side authentication}.
     */
    clientKey?: string;

    /**
     * The shopper's locale. This is used to set the language rendered in the UI.
     * For a list of supported locales, see {@link https://docs.adyen.com/checkout/components-web/localization-components | Localization}.
     * For adding a custom locale, see {@link https://docs.adyen.com/checkout/components-web/localization-components#create-localization | Create localization}.
     * @defaultValue 'en-US'
     */
    locale?: Locales | string;

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

    /**
     * @internal
     * */
    loadingContext?: string;

    analytics?: AnalyticsOptions;

    risk?: RiskModuleOptions;

    [key: string]: any;
}
