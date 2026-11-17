import { DisputeManagement, PaymentLinkCreation, PaymentLinkDetails, PayoutDetails, TransactionDetails } from '../src';
import type { PietProps } from '../src';

/**
 * Piet cannot import other domains, so the host decides what opens when the user picks a suggested action.
 * Each action mounts the existing component in Piet's modal. The assistant never performs the change itself.
 */
export const renderPietAction: NonNullable<PietProps['renderAction']> = (request, container, core) => {
    const element = (() => {
        switch (request.type) {
            case 'refundTransaction':
            case 'viewTransaction':
                return new TransactionDetails({ core, id: request.transactionId });
            case 'manageDispute':
            case 'viewDispute':
                return new DisputeManagement({ core, id: request.disputePspReference });
            case 'expirePaymentLink':
            case 'viewPaymentLink':
                return new PaymentLinkDetails({ core, id: request.paymentLinkId });
            case 'viewPayout':
                return new PayoutDetails({ core, id: request.balanceAccountId, date: request.date });
            case 'createPaymentLink':
                return new PaymentLinkCreation({ core });
        }
    })();

    element.mount(container);
    return () => element.unmount();
};
