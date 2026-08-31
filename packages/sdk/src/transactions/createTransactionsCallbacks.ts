import type { FilterType, UserEvents } from '@integration-components/core';
import type { TransactionsOverviewEventCallbacks, TransactionsView } from '@integration-components/transactions/vue';

const CATEGORY = 'Transaction component';
const DETAILS = 'Transaction details';
const INSIGHTS = 'Transactions insights';
const LIST = 'Transactions list';

const subCategoryFor = (view: TransactionsView) => (view === 'insights' ? INSIGHTS : LIST);

const FILTER_LABELS = {
    balanceAccountId: 'Balance account filter',
    categories: 'Category filter',
    currencies: 'Currency filter',
    dateRange: 'Date filter',
    insightsCurrency: 'Currency filter',
    paymentPspReference: 'PSP reference filter',
} as const satisfies Readonly<Record<string, FilterType>>;

export const createTransactionsCallbacks = (events: Partial<UserEvents>): TransactionsOverviewEventCallbacks => ({
    onDetailsLoaded: ({ source }) => {
        events.addEvent?.('Landed on page', {
            category: CATEGORY,
            subCategory: DETAILS,
            ...(source === 'overview' ? { fromPage: 'Transactions overview' } : {}),
        });
    },
    onExportCancelled: () => {
        events.addEvent?.('Cancelled export', { category: CATEGORY, subCategory: LIST });
    },
    onExportCompleted: ({ exportedFields }) => {
        const labels = { all: 'All', custom: 'Custom', default: 'Default' } as const;
        events.addEvent?.('Completed export', {
            category: CATEGORY,
            exportedFields: labels[exportedFields],
            subCategory: LIST,
        });
    },
    onExportOpened: () => {
        events.addEvent?.('Clicked button', { category: CATEGORY, label: 'Export', subCategory: LIST });
    },
    onFilterChanged: ({ action, field, value, view }) => {
        events.addModifyFilterEvent?.({
            actionType: action,
            category: CATEGORY,
            label: FILTER_LABELS[field],
            subCategory: subCategoryFor(view),
            ...(value !== undefined ? { value } : {}),
        });
    },
    onNavigationRequested: ({ destination }) => {
        events.addEvent?.('Clicked button', {
            category: CATEGORY,
            label: destination === 'refund' ? 'Return to refund' : 'Go to payment',
            subCategory: DETAILS,
        });
    },
    onRefundCancelled: () => {
        events.addEvent?.('Cancelled refund', { category: CATEGORY, subCategory: DETAILS });
    },
    onRefundCompleted: ({ full, reason }) => {
        events.addEvent?.('Completed refund', {
            category: CATEGORY,
            isFullRefund: full,
            refundReason: reason,
            subCategory: DETAILS,
        });
    },
    onRefundViewOpened: () => {
        events.addEvent?.('Switched to refund view', { category: CATEGORY, subCategory: DETAILS });
    },
    onTransactionSelected: ({ category }) => {
        if (category) {
            events.addEvent?.('Viewed transaction details', {
                category: CATEGORY,
                subCategory: DETAILS,
                transactionType: category,
            });
        }
    },
    onValueCopied: ({ field }) => {
        const labels = {
            merchantReference: 'Merchant reference',
            pspReference: 'PSP reference',
            referenceId: 'Reference ID',
        } as const;
        events.addEvent?.('Clicked button', {
            category: CATEGORY,
            label: 'Copy button',
            sectionName: 'Details',
            subCategory: DETAILS,
            subSectionName: labels[field],
        });
    },
    onViewDurationRecorded: ({ duration, view }) => {
        events.addEvent?.('Duration', { category: CATEGORY, duration, subCategory: subCategoryFor(view) });
    },
    onViewEntered: ({ view }) => {
        events.addEvent?.('Landed on page', { category: CATEGORY, subCategory: subCategoryFor(view) });
    },
});
