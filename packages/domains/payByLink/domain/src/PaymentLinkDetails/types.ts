import type { DomainTranslationKey } from '@integration-components/core/translations';
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
 * Semantic tag variant, decoupled from the UI kit's token names.
 */
export type PaymentLinkStatusTagVariant = 'info' | 'success' | 'neutral' | 'warning';

/** Structurally identical to Bento's `BentoTimelineItem` status values. */
export type PaymentLinkActivityStatus = 'green' | 'red' | 'blue' | 'black';

export type ListItemData = {
    key: DomainTranslationKey;
    value?: string;
    isCopyable?: boolean;
    linkUrl?: string;
};

export type PaymentLinkListItems = Record<'linkInformation' | 'shopperInformation' | 'shippingAddress' | 'billingAddress', ListItemData[]>;

export type PaymentLinkErrorMessageContent = {
    title: DomainTranslationKey;
    message: DomainTranslationKey[];
    refreshComponent?: boolean;
    requestId?: string;
};
