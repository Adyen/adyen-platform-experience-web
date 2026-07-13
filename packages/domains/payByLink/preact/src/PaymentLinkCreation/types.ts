import { UIElementProps } from '@integration-components/types';
import type { PaymentLinkCreationFieldsConfig, PaymentLinkCreationFormValues, StoreIds } from '../../../domain/src';

export type {
    LinkCreationFormStep,
    PaymentLinkCreationFormValues,
    PaymentLinkFieldVisibility,
    PaymentLinkParentFields,
    AmountVisibility,
    AddressVisibility,
    ShopperNameVisibility,
    LinkValidityVisibility,
    PaymentLinkFieldsVisibilityConfig,
    PaymentLinkCreationFieldsConfig,
    StoreIds,
} from '../../../domain/src';

export interface PaymentLinkCreationProps extends UIElementProps {
    fieldsConfig?: PaymentLinkCreationFieldsConfig;
    storeIds?: StoreIds;
    onPaymentLinkCreated?: (paymentLink: PaymentLinkCreationFormValues) => void;
    onCreationDismiss?: () => void;
}

export type PaymentLinkCreationComponentProps = PaymentLinkCreationProps;

// Placeholder for future configuration options
export type PaymentLinkCreationConfig = Record<never, never>;
