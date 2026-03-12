import { UIElementProps, DeepPartial } from '../../types';
import { IPaymentLinkCreateRequest } from '../../../types/api/models/payByLink';
import { FieldValues } from '../../../hooks/form/types';

/** Form step identifiers for payment link creation */
export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

/** Form values for payment link creation */
export type PaymentLinkCreationFormValues = IPaymentLinkCreateRequest & {
    store: string;
};

/** Field visibility options */
export type PaymentLinkFieldVisibility = 'hidden' | 'readOnly';

/** Parent field names that support nested visibility */
export type PaymentLinkParentFields = 'amount' | 'deliveryAddress' | 'billingAddress' | 'shopperName' | 'linkValidity';

/** Nested visibility configuration for amount field */
export type AmountVisibility = PaymentLinkFieldVisibility | Partial<Record<'currency' | 'value', PaymentLinkFieldVisibility>>;

/** Nested visibility configuration for address fields */
export type AddressVisibility =
    | PaymentLinkFieldVisibility
    | Partial<Record<'city' | 'country' | 'houseNumberOrName' | 'postalCode' | 'street' | 'stateOrProvince', PaymentLinkFieldVisibility>>;

/** Nested visibility configuration for shopper name field */
export type ShopperNameVisibility = PaymentLinkFieldVisibility | Partial<Record<'firstName' | 'lastName', PaymentLinkFieldVisibility>>;

/** Nested visibility configuration for link validity field */
export type LinkValidityVisibility = PaymentLinkFieldVisibility | Partial<Record<'durationUnit' | 'quantity', PaymentLinkFieldVisibility>>;

/** Visibility configuration for payment link fields */
export type PaymentLinkFieldsVisibilityConfig = Partial<
    Omit<Record<FieldValues<PaymentLinkCreationFormValues>, PaymentLinkFieldVisibility>, PaymentLinkParentFields> & {
        amount?: AmountVisibility;
        deliveryAddress?: AddressVisibility;
        billingAddress?: AddressVisibility;
        shopperName?: ShopperNameVisibility;
        linkValidity?: LinkValidityVisibility;
    }
>;

/** Configuration for payment link creation fields */
export interface PaymentLinkCreationFieldsConfig {
    /** Default data values for form fields */
    data?: DeepPartial<PaymentLinkCreationFormValues>;
    /** Visibility configuration for form fields */
    visibility?: PaymentLinkFieldsVisibilityConfig;
}

/** Props for the PaymentLinkCreation component */
export interface PaymentLinkCreationProps extends UIElementProps {
    /** Configuration for form fields */
    fieldsConfig?: PaymentLinkCreationFieldsConfig;
    /** Store IDs for store selection */
    storeIds?: string[] | string;
    /** Callback when a payment link is successfully created */
    onPaymentLinkCreated?: (paymentLink: PaymentLinkCreationFormValues) => void;
    /** Callback when creation is dismissed */
    onCreationDismiss?: () => void;
}

/**
 * Public component props exported from the Element
 */
export type PaymentLinkCreationComponentProps = PaymentLinkCreationProps;

/** Main configuration interface */
export interface PaymentLinkCreationConfig {
    // Placeholder for future configuration options
}
