import { UIElementProps } from '@integration-components/types';

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
import { IPaymentLinkCreateRequest } from '@integration-components/types';
import { FieldValues } from '@integration-components/hooks-preact/form/types';

export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

export type PaymentLinkCreationFormValues = IPaymentLinkCreateRequest & {
    store: string;
};

export type PaymentLinkFieldVisibility = 'hidden' | 'readOnly';

export type PaymentLinkParentFields = 'amount' | 'deliveryAddress' | 'billingAddress' | 'shopperName' | 'linkValidity';

export type AmountVisibility = PaymentLinkFieldVisibility | Partial<Record<'currency' | 'value', PaymentLinkFieldVisibility>>;

export type AddressVisibility =
    | PaymentLinkFieldVisibility
    | Partial<Record<'city' | 'country' | 'houseNumberOrName' | 'postalCode' | 'street' | 'stateOrProvince', PaymentLinkFieldVisibility>>;

export type ShopperNameVisibility = PaymentLinkFieldVisibility | Partial<Record<'firstName' | 'lastName', PaymentLinkFieldVisibility>>;

export type LinkValidityVisibility = PaymentLinkFieldVisibility | Partial<Record<'durationUnit' | 'quantity', PaymentLinkFieldVisibility>>;

export type PaymentLinkFieldsVisibilityConfig = Partial<
    Omit<Record<FieldValues<PaymentLinkCreationFormValues>, PaymentLinkFieldVisibility>, PaymentLinkParentFields> & {
        amount?: AmountVisibility;
        deliveryAddress?: AddressVisibility;
        billingAddress?: AddressVisibility;
        shopperName?: ShopperNameVisibility;
        linkValidity?: LinkValidityVisibility;
    }
>;

export interface PaymentLinkCreationFieldsConfig {
    data?: DeepPartial<PaymentLinkCreationFormValues>;
    visibility?: PaymentLinkFieldsVisibilityConfig;
}

export interface PaymentLinkCreationProps extends UIElementProps {
    fieldsConfig?: PaymentLinkCreationFieldsConfig;
    storeIds?: string[] | string;
    onPaymentLinkCreated?: (paymentLink: PaymentLinkCreationFormValues) => void;
    onCreationDismiss?: () => void;
}

export type PaymentLinkCreationComponentProps = PaymentLinkCreationProps;

// Placeholder for future configuration options
export type PaymentLinkCreationConfig = Record<never, never>;
