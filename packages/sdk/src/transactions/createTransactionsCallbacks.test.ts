import { describe, expect, test, vi } from 'vitest';
import type { UserEvents } from '@integration-components/core';
import { createTransactionsCallbacks } from './createTransactionsCallbacks';

const createEvents = () => ({
    addEvent: vi.fn(),
    addModifyFilterEvent: vi.fn(),
});

describe('createTransactionsCallbacks', () => {
    test('maps semantic overview events to the Core analytics contract', () => {
        const events = createEvents();
        const callbacks = createTransactionsCallbacks(events as unknown as Partial<UserEvents>);

        callbacks.onViewEntered?.({ view: 'transactions' });
        callbacks.onFilterChanged?.({ action: 'update', field: 'categories', value: 'payment', view: 'insights' });
        callbacks.onTransactionSelected?.({ category: 'payment', id: 'TX_1', showModal: vi.fn() });

        expect(events.addEvent).toHaveBeenNthCalledWith(1, 'Landed on page', {
            category: 'Transaction component',
            subCategory: 'Transactions list',
        });
        expect(events.addModifyFilterEvent).toHaveBeenCalledWith({
            actionType: 'update',
            category: 'Transaction component',
            label: 'Category filter',
            subCategory: 'Transactions insights',
            value: 'payment',
        });
        expect(events.addEvent).toHaveBeenNthCalledWith(2, 'Viewed transaction details', {
            category: 'Transaction component',
            subCategory: 'Transaction details',
            transactionType: 'payment',
        });
    });

    test('maps details, export, copy, navigation, and refund payloads centrally', () => {
        const events = createEvents();
        const callbacks = createTransactionsCallbacks(events as unknown as Partial<UserEvents>);

        callbacks.onDetailsLoaded?.({ source: 'overview', transactionId: 'TX_1' });
        callbacks.onExportCompleted?.({ exportedFields: 'custom', view: 'transactions' });
        callbacks.onValueCopied?.({ field: 'referenceId', transactionId: 'TX_1' });
        callbacks.onNavigationRequested?.({ destination: 'refund', transactionId: 'TX_1' });
        callbacks.onRefundCompleted?.({ full: false, reason: 'requested_by_customer', transactionId: 'TX_1' });

        expect(events.addEvent).toHaveBeenNthCalledWith(1, 'Landed on page', {
            category: 'Transaction component',
            fromPage: 'Transactions overview',
            subCategory: 'Transaction details',
        });
        expect(events.addEvent).toHaveBeenNthCalledWith(2, 'Completed export', {
            category: 'Transaction component',
            exportedFields: 'Custom',
            subCategory: 'Transactions list',
        });
        expect(events.addEvent).toHaveBeenNthCalledWith(3, 'Clicked button', {
            category: 'Transaction component',
            label: 'Copy button',
            sectionName: 'Details',
            subCategory: 'Transaction details',
            subSectionName: 'Reference ID',
        });
        expect(events.addEvent).toHaveBeenNthCalledWith(4, 'Clicked button', {
            category: 'Transaction component',
            label: 'Return to refund',
            subCategory: 'Transaction details',
        });
        expect(events.addEvent).toHaveBeenNthCalledWith(5, 'Completed refund', {
            category: 'Transaction component',
            isFullRefund: false,
            refundReason: 'requested_by_customer',
            subCategory: 'Transaction details',
        });
    });

    test('does not emit transaction-selection analytics without a category', () => {
        const events = createEvents();
        const callbacks = createTransactionsCallbacks(events as unknown as Partial<UserEvents>);

        callbacks.onTransactionSelected?.({ id: 'TX_1', showModal: vi.fn() });

        expect(events.addEvent).not.toHaveBeenCalled();
    });
});
