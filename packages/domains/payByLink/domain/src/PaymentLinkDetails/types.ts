import type { PayByLinkTranslationKey } from '../shared/types';

export interface PaymentLinkDetailsProps {
    id: string;
}

export type PaymentLinkDetailsScreen = 'details' | 'expirationConfirmation' | 'expirationSuccess';

/**
 * Semantic tag variant, decoupled from the UI kit's token names.
 */
export type PaymentLinkStatusTagVariant = 'info' | 'success' | 'neutral' | 'warning';

/** Structurally identical to Bento's `BentoTimelineItem` status values. */
export type PaymentLinkActivityStatus = 'green' | 'red' | 'blue' | 'black';

export type ListItemData = {
    key: PayByLinkTranslationKey;
    value?: string;
    isCopyable?: boolean;
    linkUrl?: string;
};

export type PaymentLinkListItems = Record<'linkInformation' | 'shopperInformation' | 'shippingAddress' | 'billingAddress', ListItemData[]>;

export type PaymentLinkErrorMessageContent = {
    title: PayByLinkTranslationKey;
    message: PayByLinkTranslationKey[];
    refreshComponent?: boolean;
    requestId?: string;
};
