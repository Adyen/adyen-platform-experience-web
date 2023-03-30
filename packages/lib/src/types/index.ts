import { ADDRESS_SCHEMA } from '../components/internal/Address/constants';
import componentsMap from '../components';
import { ValueOf } from '../utils/types';
import { AddressSpecifications } from '../components/internal/Address/types';

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

export type Specification = AddressSpecifications;

export type PersonalDetailsSchema = {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
    shopperEmail?: string;
    telephoneNumber?: string;
};

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
export type ComponentMap = typeof componentsMap;
export type ComponentOptions<Name extends keyof ComponentMap> = ConstructorParameters<ComponentMap[Name]>[0];

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

export function isKeyOfComponent(component: string): component is keyof ComponentMap {
    return !!componentsMap[component as keyof ComponentMap];
}
export function isAvailableOfComponent(component: any): component is ValueOf<ComponentMap> {
    return !!(Object.keys(componentsMap) as (keyof typeof componentsMap)[])?.find(key => componentsMap[key] === component);
}
