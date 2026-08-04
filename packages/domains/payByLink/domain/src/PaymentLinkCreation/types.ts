import type { DeepPartial, IPaymentLinkCreateRequest } from '@integration-components/types';
import type { SuccessResponse } from '@integration-components/types/api/endpoints';
import type { StoreIds } from '../types';

export type LinkCreationFormStep = 'store' | 'payment' | 'customer' | 'summary';

export type PaymentLinkCreationFormValues = IPaymentLinkCreateRequest & {
    store: string;
};

type Primitive = string | number | boolean | Date | File | FileList | null | undefined;

type NestedPaths<T, Prefix extends string = ''> = T extends Primitive | readonly unknown[]
    ? Prefix
    : {
          [K in keyof T & string]: K extends string
              ? Prefix extends ''
                  ? K | NestedPaths<T[K], K>
                  : `${Prefix}.${K}` | NestedPaths<T[K], `${Prefix}.${K}`>
              : never;
      }[keyof T & string];

export type FieldValues<TFieldValues> = NestedPaths<TFieldValues> | Exclude<keyof TFieldValues, number | symbol>;

export type PaymentLinkFieldName = FieldValues<PaymentLinkCreationFormValues>;

export type PaymentLinkFieldVisibility = 'hidden' | 'readOnly';

export type PaymentLinkParentFields = 'amount' | 'deliveryAddress' | 'billingAddress' | 'shopperName' | 'linkValidity';

export type AmountVisibility = PaymentLinkFieldVisibility | Partial<Record<'currency' | 'value', PaymentLinkFieldVisibility>>;

export type AddressVisibility =
    | PaymentLinkFieldVisibility
    | Partial<Record<'city' | 'country' | 'houseNumberOrName' | 'postalCode' | 'street' | 'stateOrProvince', PaymentLinkFieldVisibility>>;

export type ShopperNameVisibility = PaymentLinkFieldVisibility | Partial<Record<'firstName' | 'lastName', PaymentLinkFieldVisibility>>;

export type LinkValidityVisibility = PaymentLinkFieldVisibility | Partial<Record<'durationUnit' | 'quantity', PaymentLinkFieldVisibility>>;

export type PaymentLinkFieldsVisibilityConfig = Partial<
    Omit<Record<PaymentLinkFieldName, PaymentLinkFieldVisibility>, PaymentLinkParentFields> & {
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

export type CreatedPaymentLink = SuccessResponse<'createPBLPaymentLink'>;

export type PaymentLinkCreatedData = PaymentLinkCreationFormValues & { paymentLink: CreatedPaymentLink };

export interface PaymentLinkCreationProps {
    fieldsConfig?: PaymentLinkCreationFieldsConfig;
    storeIds?: StoreIds;
    hideTitle?: boolean;
    onPaymentLinkCreated?: (paymentLink: PaymentLinkCreationFormValues) => void;
    onCreationDismiss?: () => void;
    onContactSupport?: () => void;
    onShowDetails?: (data: { id: string; url: string }) => void;
}

export type PaymentLinkCreationComponentProps = PaymentLinkCreationProps;
