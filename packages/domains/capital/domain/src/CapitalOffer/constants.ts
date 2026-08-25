import { BaseEventProperties } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';

export const DEFAULT_TERM = 180;
export const DYNAMIC_OFFER_DEBOUNCE_MS = 300;
export const DYNAMIC_OFFER_RETRY_COUNT = 1;

export const sharedCapitalOfferAnalyticsEventProperties = {
    componentName: 'capitalOffer' satisfies BaseEventProperties['componentName'],
    category: 'Capital offer component',
} as const;
