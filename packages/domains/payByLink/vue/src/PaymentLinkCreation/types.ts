import type { UIElementProps } from '@integration-components/core/vue';
import type { PaymentLinkCreationProps } from '../../../domain/src';

export type PaymentLinkCreationExternalProps = UIElementProps & PaymentLinkCreationProps;

export type PaymentLinkCreationComponentProps = Omit<PaymentLinkCreationExternalProps, 'core' | 'appearance'> & {
    embeddedInOverview?: boolean;
    onContactSupport?: () => void;
    onShowDetails?: (data: { id: string; url: string }) => void;
};
