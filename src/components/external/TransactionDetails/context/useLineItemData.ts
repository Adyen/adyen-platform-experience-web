import { useCallback, useMemo } from 'preact/hooks';
import { ILineItem, ITransaction, ITransactionLineItem } from '../../../../types';
import { components } from '../../../../types/api/resources/TransactionsResource';
import useTransactionDetailsContext from './details';
import { useTransactionRefundContext } from './refund';
import { ActiveView } from './types';

interface ILineItemRefundData {
    selectAllItems: () => void;
    clearAllItems: () => void;
    allItemsQuantity: () => number;
    allItemsAmount: () => ITransaction['amount'];
}

type RefundStatus = components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available';
type TransactionLineItemsByRefundStatus = Map<RefundStatus, ITransactionLineItem[]>;

export const useLineItemData = (view: ActiveView) => {
    const {
        transaction: { lineItems },
    } = useTransactionDetailsContext();
    const { availableItems: refundItems, items: selectedItems, updateItems, clearItems, availableAmount, currency } = useTransactionRefundContext();

    const allItems: Readonly<ILineItem[]> = useMemo(() => (view === ActiveView.REFUND ? refundItems : lineItems), [view]);

    const itemsWithStatus = useMemo(
        () =>
            allItems.reduce((current: TransactionLineItemsByRefundStatus, item: ILineItem) => {
                const currentValue = current.get('available');
                const valueToAdd = currentValue ? [...currentValue, item] : [item];
                current.set('available', valueToAdd);
                //TODO: Remove or comment out this logic when the research completed
                // if (item.refundStatuses && item.refundStatuses.length > 0) {
                //     item.refundStatuses.map(status => {
                //         const statusValue = current.get(status.status);
                //         const statusValueToAdd = statusValue
                //             ? [...statusValue, { ...item, availableQuantity: status.quantity }]
                //             : [{ ...item, availableQuantity: status.quantity }];
                //         current.set(status.status, statusValueToAdd);
                //     });
                // }
                return current;
            }, new Map()),
        [allItems]
    );

    const hasSelectAll = useMemo(() => view === ActiveView.REFUND && allItems.length >= 5, [view, allItems]);

    const selectAllItems = useCallback<ILineItemRefundData['selectAllItems']>(() => {
        const itemsToRefund = refundItems.map(({ reference, availableQuantity: quantity, amountIncludingTax: amount }) => ({
            reference,
            amount: amount.value,
            quantity,
        }));
        updateItems(itemsToRefund);
    }, [refundItems, updateItems]);

    const calculateAllItemsQuantity = useCallback<ILineItemRefundData['allItemsQuantity']>(
        () => refundItems.reduce((current, { availableQuantity }) => current + availableQuantity, 0),
        [refundItems]
    );

    const clearAllItems = useCallback<ILineItemRefundData['selectAllItems']>(() => {
        const refsToUnselect = selectedItems.map(item => item.reference);
        clearItems(refsToUnselect);
    }, [selectedItems, clearItems]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                clearAllItems();
            } else {
                selectAllItems();
            }
        },
        [clearAllItems, selectAllItems, selectedItems]
    );

    const statusByView: RefundStatus[] | undefined = useMemo(() => {
        switch (view) {
            case ActiveView.DETAILS:
                return ['in_progress', 'completed', 'failed', 'available'];
            case ActiveView.REFUND:
                return ['available'];
            default:
                return undefined;
        }
    }, [view]);

    const totalAmount = useMemo(() => ({ value: availableAmount, currency }), [availableAmount, currency]);
    const totalQuantity = useMemo(() => calculateAllItemsQuantity(), [calculateAllItemsQuantity]);
    const statuses = useMemo(() => Array.from(itemsWithStatus.keys()), [itemsWithStatus]);
    const statusesByCurrentView = useMemo(() => statusByView?.filter((s: RefundStatus) => statuses?.includes(s)), [itemsWithStatus]);
    const lineItemsByStatus = useMemo(
        () =>
            statuses.reduce((current, status) => {
                current[status] = itemsWithStatus.get(status) ?? [];
                return current;
            }, {} as Record<RefundStatus, ILineItem[]>),
        [statuses, itemsWithStatus]
    );

    return {
        itemsWithStatus,
        lineItemsByStatus,
        hasSelectAll,
        clearAllItems,
        totalAmount,
        totalQuantity,
        selectAllItems,
        handleSelectAll,
        statusesByCurrentView,
    };
};

export default useLineItemData;
