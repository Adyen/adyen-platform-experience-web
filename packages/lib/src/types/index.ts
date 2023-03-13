import components from '../components';
import { ADDRESS_SCHEMA } from '../components/internal/Address/constants';

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v52/payments__reqParam_amount API Explorer /payments amount}
 */
export interface Amount {
    value: number;
    currency: string;
}

export interface AmountExtended extends Amount {
    /**
     * Adds currencyDisplay prop - as a way for the merchant to influence the final display of the amount on the pay button.
     * Defaults to 'symbol'.
     * see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#currencydisplay
     */
    currencyDisplay?: string;
}

export type AddressField = (typeof ADDRESS_SCHEMA)[number];

export type AddressData = {
    [key in AddressField]: string;
};

export interface PersonalDetailsSchema {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
}

/**
 * {@link https://docs.adyen.com/api-explorer/#/PaymentSetupAndVerificationService/v52/post/payments__reqParam_browserInfo API Explorer /payments browserInfo}
 */
export interface BrowserInfo {
    acceptHeader: string;
    colorDepth: string;
    language: string;
    javaEnabled: boolean;
    screenHeight: string;
    screenWidth: string;
    userAgent: string;
    timeZoneOffset: number;
}

/**
 * Available components
 */
export type Components = typeof components;

/**
 * Visibility options for a fieldset
 */
export type FieldsetVisibility = 'editable' | 'hidden' | 'readOnly';

export type Session = {
    id: string;
    sessionData: string;
};

export type SessionConfiguration = {
    enableStoreDetails: boolean;
};

export type SessionSetupResponse = {
    id: string;
    sessionData: string;

    amount: Amount;
    expiresAt: string;
    components: any;
    returnUrl: string;
    configuration: SessionConfiguration;
};
