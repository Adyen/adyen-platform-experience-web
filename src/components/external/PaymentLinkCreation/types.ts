import { UIElementProps, DeepPartial } from '../../types';
import { IPaymentLinkCreateRequest } from '../../../types/api/models/payByLink';
import { FieldValues } from '../../../hooks/form/types';

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

export interface PaymentLinkCreationConfig {}
