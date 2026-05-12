import { UIElementProps } from '@integration-components/types';

export interface PaymentLinkSettingsProps extends UIElementProps {
    storeIds?: string[] | string;
}

export type PaymentLinkSettingsComponentProps = PaymentLinkSettingsProps;
