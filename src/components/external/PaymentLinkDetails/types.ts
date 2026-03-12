import { UIElementProps } from '../../types';

/** Props for the PaymentLinkDetails component */
export interface PaymentLinkDetailsProps extends UIElementProps {
    /** The payment link ID to display details for */
    id: string;
    /** Callback fired when user requests contact support */
    onContactSupport?: () => void;
    /** Callback fired when the details modal is dismissed */
    onDismiss?: () => void;
    /** Callback fired when the payment link is updated */
    onUpdate?: () => void;
}

/**
 * Public component props exported from the Element
 */
export type PaymentLinkDetailsComponentProps = PaymentLinkDetailsProps;

/** Main configuration interface */
export interface PaymentLinkDetailsConfig {
    // Placeholder for future configuration options
}
