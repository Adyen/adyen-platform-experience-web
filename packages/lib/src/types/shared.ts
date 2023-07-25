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

/**
 * Visibility options for a fieldset
 */
export type FieldsetVisibility = 'editable' | 'hidden' | 'readOnly';
