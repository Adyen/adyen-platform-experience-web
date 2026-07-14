import type { TranslationKey } from '@integration-components/core';
import type { UIElementProps } from '@integration-components/types';

export interface PaymentLinkDetailsProps extends UIElementProps {
    id: string;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onUpdate?: () => void;
}

export type PaymentLinkDetailsComponentProps = PaymentLinkDetailsProps;

export type PaymentLinkDetailsScreen = 'details' | 'expirationConfirmation' | 'expirationSuccess';

/**
 * Semantic tag variant, decoupled from any particular UI kit's naming (Preact's `TagVariant` enum vs.
 * Bento's `blue`/`green`/`grey`/`orange` strings differ, so each framework maps this to its own tokens).
 */
export type PaymentLinkStatusTagVariant = 'info' | 'success' | 'neutral' | 'warning';

/** Structurally identical to both ui-components-preact's `TimelineStatus` and Bento's `BentoTimelineItem` status values. */
export type PaymentLinkActivityStatus = 'green' | 'red' | 'blue' | 'black';

export type ListItemData = {
    key: TranslationKey;
    value?: string;
    isCopyable?: boolean;
    linkUrl?: string;
};

export type PaymentLinkListItems = Record<'linkInformation' | 'shopperInformation' | 'shippingAddress' | 'billingAddress', ListItemData[]>;

export type PaymentLinkErrorMessageContent = {
    title: TranslationKey;
    message: TranslationKey[];
    refreshComponent?: boolean;
    requestId?: string;
};
