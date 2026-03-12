import { UIElementProps } from '../../types';

/** Store IDs for filtering payment links */
export type StoreIds = string[] | string;

/**
 * Sub-component props (without inherited props)
 */
type PaymentLinkOverviewSubComponentProps<Props> = Omit<Props, 'onContactSupport' | 'storeIds' | 'ref'>;

/**
 * Props for the PaymentLinksOverview component
 */
export interface PaymentLinksOverviewProps extends UIElementProps {
    /** Allow user to change the number of items displayed per page */
    allowLimitSelection?: boolean;
    /** Pre-select a specific balance account */
    balanceAccountId?: string;
    /** Callback when filters change - receives the current filter values */
    onFiltersChanged?: (filters: {
        balanceAccountId?: string;
        linkTypes?: string;
        statuses?: string;
        createdSince?: string;
        createdUntil?: string;
        storeIds?: string;
        merchantReference?: string;
        paymentLinkId?: string;
    }) => any;
    /** Default number of items per page */
    preferredLimit?: 10 | 20;
    /** Show the details modal when clicking a row */
    showDetails?: boolean;
    /** Callback when a payment link is selected */
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    /** Store IDs to filter by */
    storeIds?: StoreIds;
    /** Payment link creation sub-component configuration */
    paymentLinkCreation?: PaymentLinkOverviewSubComponentProps<{
        /** Callback when a payment link is created */
        onPaymentLinkCreated?: (paymentLink: any) => void;
        /** Callback when creation is dismissed */
        onCreationDismiss?: () => void;
    }>;
    /** Payment link settings sub-component configuration */
    paymentLinkSettings?: PaymentLinkOverviewSubComponentProps<{
        /** Store IDs for settings */
        storeIds?: string[] | string;
    }>;
}

/**
 * Public component props exported from the Element
 */
export type PaymentLinksOverviewComponentProps = PaymentLinksOverviewProps;
