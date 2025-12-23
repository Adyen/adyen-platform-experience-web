import { TranslationKey } from '../../../../../translations';
import { TimelineStatus } from '../../../../internal/Timeline/types';
import { IPaymentLinkActivity } from '../../../../../types';

export const getTitleKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.type) {
        case 'createdAction':
            return 'paymentLinks.details.activity.created';
        case 'expiredAction':
            return 'paymentLinks.details.activity.expired';
        case 'paymentAttempt':
            return 'paymentLinks.details.activity.paymentAttempt';
        default:
            return undefined;
    }
};

export const getDescriptionKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.expirationReason) {
        case 'maximumAttemptsReached':
            return 'paymentLinks.details.activity.expirationReason.maximumAttemptsReached';
        case 'manuallyExpired':
            return 'paymentLinks.details.activity.expirationReason.manuallyExpired';
        case 'expirationDateReached':
            return 'paymentLinks.details.activity.expirationReason.expirationDateReached';
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
