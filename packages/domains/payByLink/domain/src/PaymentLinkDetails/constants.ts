import type { IPaymentLinkStatus } from '@integration-components/types';
import type { PaymentLinkStatusTagVariant } from './types';

export const PAYMENT_LINK_STATUS_TAG_VARIANT: Record<IPaymentLinkStatus, PaymentLinkStatusTagVariant> = {
    active: 'info',
    completed: 'success',
    expired: 'neutral',
    paymentPending: 'warning',
};
