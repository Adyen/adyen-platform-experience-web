import { UIElementProps } from '../../types';

export interface PaymentLinkDetailsProps extends UIElementProps {
    id: string;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onUpdate?: () => void;
}

export type PaymentLinkDetailsComponentProps = PaymentLinkDetailsProps;
