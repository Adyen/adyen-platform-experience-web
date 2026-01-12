import { TranslationKey } from '../../../../../../translations';
import { TimelineStatus } from '../../../../../internal/Timeline/types';
import { IPaymentLinkActivity } from '../../../../../../types';

export const getTitleKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.type) {
        case 'createdAction':
            return 'payByLink.details.activity.created';
        case 'expiredAction':
            return 'payByLink.details.activity.expired';
        case 'paymentAttempt':
            return 'payByLink.details.activity.paymentAttempt';
        default:
            return undefined;
    }
};

export const getDescriptionKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.expirationReason) {
        case 'maximumAttemptsReached':
            return 'payByLink.details.activity.expirationReason.maximumAttemptsReached';
        case 'manuallyExpired':
            return 'payByLink.details.activity.expirationReason.manuallyExpired';
        case 'expirationDateReached':
            return 'payByLink.details.activity.expirationReason.expirationDateReached';
        default:
            return undefined;
    }
};

export const getStatus = (activity: IPaymentLinkActivity): TimelineStatus => {
    switch (activity.type) {
        case 'createdAction':
            return 'green';
        case 'expiredAction':
            return 'red';
        case 'paymentAttempt':
            return 'blue';
        default:
            return 'black';
    }
};
