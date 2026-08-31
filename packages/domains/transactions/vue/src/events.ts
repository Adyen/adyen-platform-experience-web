import { createDomainEventBridge, type DomainEventCallbacks } from '@integration-components/composables-vue/createDomainEventBridge';
import type { RefundReason } from '../../domain/src';

export type TransactionsView = 'insights' | 'transactions';

export type TransactionsContactSupportRequestedPayload = Readonly<{
    component: 'details' | 'overview';
    transactionId?: string;
}>;

export type TransactionsFiltersChangedPayload = Readonly<Record<string, string | undefined>>;

export type TransactionSelectedPayload = Readonly<{
    category?: string;
    id: string;
    showModal(): void;
}>;

export type TransactionsViewEnteredPayload = Readonly<{ view: TransactionsView }>;
export type TransactionsViewDurationRecordedPayload = Readonly<{ duration: number; view: TransactionsView }>;

export type TransactionsFilterField = 'balanceAccountId' | 'categories' | 'currencies' | 'dateRange' | 'insightsCurrency' | 'paymentPspReference';

export type TransactionsFilterChangedPayload = Readonly<{
    action: 'reset' | 'update';
    field: TransactionsFilterField;
    value?: string | null;
    view: TransactionsView;
}>;

export type TransactionsExportOpenedPayload = Readonly<{ view: 'transactions' }>;
export type TransactionsExportCancelledPayload = Readonly<{ view: 'transactions' }>;
export type TransactionsExportCompletedPayload = Readonly<{
    exportedFields: 'all' | 'custom' | 'default';
    view: 'transactions';
}>;

export type TransactionDetailsLoadedPayload = Readonly<{
    source: 'direct' | 'overview';
    transactionId: string;
}>;

export type TransactionValueCopiedPayload = Readonly<{
    field: 'merchantReference' | 'pspReference' | 'referenceId';
    transactionId: string;
}>;

export type TransactionNavigationRequestedPayload = Readonly<{
    destination: 'payment' | 'refund';
    transactionId: string;
}>;

export type TransactionRefundViewOpenedPayload = Readonly<{ transactionId: string }>;
export type TransactionRefundCancelledPayload = Readonly<{ transactionId: string }>;
export type TransactionRefundCompletedPayload = Readonly<{
    full: boolean;
    reason: RefundReason;
    transactionId: string;
}>;

export type TransactionDetailsEventMap = Readonly<{
    contactSupportRequested: TransactionsContactSupportRequestedPayload;
    detailsLoaded: TransactionDetailsLoadedPayload;
    navigationRequested: TransactionNavigationRequestedPayload;
    refundCancelled: TransactionRefundCancelledPayload;
    refundCompleted: TransactionRefundCompletedPayload;
    refundViewOpened: TransactionRefundViewOpenedPayload;
    valueCopied: TransactionValueCopiedPayload;
}>;

export type TransactionsOverviewEventMap = TransactionDetailsEventMap &
    Readonly<{
        exportCancelled: TransactionsExportCancelledPayload;
        exportCompleted: TransactionsExportCompletedPayload;
        exportOpened: TransactionsExportOpenedPayload;
        filterChanged: TransactionsFilterChangedPayload;
        filtersChanged: TransactionsFiltersChangedPayload;
        transactionSelected: TransactionSelectedPayload;
        viewDurationRecorded: TransactionsViewDurationRecordedPayload;
        viewEntered: TransactionsViewEnteredPayload;
    }>;

export type TransactionsOverviewEventCallbacks = DomainEventCallbacks<TransactionsOverviewEventMap>;
export type TransactionDetailsEventCallbacks = DomainEventCallbacks<TransactionDetailsEventMap>;

export type TransactionsContactSupportRequestedCallback = NonNullable<TransactionsOverviewEventCallbacks['onContactSupportRequested']>;
export type TransactionsFiltersChangedCallback = NonNullable<TransactionsOverviewEventCallbacks['onFiltersChanged']>;
export type TransactionSelectedCallback = NonNullable<TransactionsOverviewEventCallbacks['onTransactionSelected']>;
export type TransactionsViewEnteredCallback = NonNullable<TransactionsOverviewEventCallbacks['onViewEntered']>;
export type TransactionsViewDurationRecordedCallback = NonNullable<TransactionsOverviewEventCallbacks['onViewDurationRecorded']>;
export type TransactionsFilterChangedCallback = NonNullable<TransactionsOverviewEventCallbacks['onFilterChanged']>;
export type TransactionsExportOpenedCallback = NonNullable<TransactionsOverviewEventCallbacks['onExportOpened']>;
export type TransactionsExportCancelledCallback = NonNullable<TransactionsOverviewEventCallbacks['onExportCancelled']>;
export type TransactionsExportCompletedCallback = NonNullable<TransactionsOverviewEventCallbacks['onExportCompleted']>;
export type TransactionDetailsLoadedCallback = NonNullable<TransactionDetailsEventCallbacks['onDetailsLoaded']>;
export type TransactionValueCopiedCallback = NonNullable<TransactionDetailsEventCallbacks['onValueCopied']>;
export type TransactionNavigationRequestedCallback = NonNullable<TransactionDetailsEventCallbacks['onNavigationRequested']>;
export type TransactionRefundViewOpenedCallback = NonNullable<TransactionDetailsEventCallbacks['onRefundViewOpened']>;
export type TransactionRefundCancelledCallback = NonNullable<TransactionDetailsEventCallbacks['onRefundCancelled']>;
export type TransactionRefundCompletedCallback = NonNullable<TransactionDetailsEventCallbacks['onRefundCompleted']>;

export type TransactionsOverviewEmits = {
    contactSupportRequested: [payload: TransactionsContactSupportRequestedPayload];
    detailsLoaded: [payload: TransactionDetailsLoadedPayload];
    exportCancelled: [payload: TransactionsExportCancelledPayload];
    exportCompleted: [payload: TransactionsExportCompletedPayload];
    exportOpened: [payload: TransactionsExportOpenedPayload];
    filterChanged: [payload: TransactionsFilterChangedPayload];
    filtersChanged: [payload: TransactionsFiltersChangedPayload];
    navigationRequested: [payload: TransactionNavigationRequestedPayload];
    refundCancelled: [payload: TransactionRefundCancelledPayload];
    refundCompleted: [payload: TransactionRefundCompletedPayload];
    refundViewOpened: [payload: TransactionRefundViewOpenedPayload];
    transactionSelected: [payload: TransactionSelectedPayload];
    valueCopied: [payload: TransactionValueCopiedPayload];
    viewDurationRecorded: [payload: TransactionsViewDurationRecordedPayload];
    viewEntered: [payload: TransactionsViewEnteredPayload];
};

export type TransactionDetailsEmits = {
    contactSupportRequested: [payload: TransactionsContactSupportRequestedPayload];
    detailsLoaded: [payload: TransactionDetailsLoadedPayload];
    navigationRequested: [payload: TransactionNavigationRequestedPayload];
    refundCancelled: [payload: TransactionRefundCancelledPayload];
    refundCompleted: [payload: TransactionRefundCompletedPayload];
    refundViewOpened: [payload: TransactionRefundViewOpenedPayload];
    valueCopied: [payload: TransactionValueCopiedPayload];
};

export const transactionsOverviewEventBridge = createDomainEventBridge<TransactionsOverviewEventMap>('Transactions overview events');
export const transactionDetailsEventBridge = createDomainEventBridge<TransactionDetailsEventMap>('Transaction details events');
