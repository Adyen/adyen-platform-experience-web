import { UIElementProps } from '../../types';

export type StoreIds = string[] | string;

type PaymentLinkOverviewSubComponentProps<Props> = Omit<Props, 'onContactSupport' | 'storeIds' | 'ref'>;

export interface PaymentLinksOverviewProps extends UIElementProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
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
    preferredLimit?: 10 | 20;
    showDetails?: boolean;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => any;
    storeIds?: StoreIds;
    paymentLinkCreation?: PaymentLinkOverviewSubComponentProps<{
        onPaymentLinkCreated?: (paymentLink: any) => void;
        onCreationDismiss?: () => void;
    }>;
    paymentLinkSettings?: PaymentLinkOverviewSubComponentProps<{
        storeIds?: string[] | string;
    }>;
}

export type PaymentLinksOverviewComponentProps = PaymentLinksOverviewProps;
