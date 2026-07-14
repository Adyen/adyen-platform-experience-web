import { UIElementProps } from '@integration-components/types';
import type { StoreIds } from '@integration-components/payByLink/domain';

export interface PaymentLinkSettingsProps extends UIElementProps {
    storeIds?: StoreIds;
}

export type PaymentLinkSettingsComponentProps = PaymentLinkSettingsProps;
