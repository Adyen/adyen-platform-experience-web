import { BaseEventProperties } from '../../../../../../core/Analytics/analytics/user-events';

export const CAPITAL_OFFER_CLASS_NAMES = {
    base: 'adyen-pe-capital-offer',
    errorContainer: 'adyen-pe-capital-offer__error-container',
};

export const sharedCapitalOfferAnalyticsEventProperties = {
    componentName: 'capitalOffer' satisfies BaseEventProperties['componentName'],
    category: 'Capital offer component',
} as const;
