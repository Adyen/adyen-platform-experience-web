import { UIElementProps } from '../../types';

export interface PaymentLinkSettingsProps extends UIElementProps {
    storeIds?: string[] | string;
}

export type PaymentLinkSettingsComponentProps = PaymentLinkSettingsProps;

export interface PaymentLinkSettingsConfig {}
