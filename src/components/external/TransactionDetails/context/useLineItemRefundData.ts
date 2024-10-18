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

type itemsByStatus = Map<components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available', ITransactionLineItem[]>;

export const useRefundCapabilityData = (view: ActiveView) => {
    const {
        transaction: { lineItems },
    } = useTransactionDetailsContext();
    const { availableItems: refundItems, items: selectedItems, updateItems, clearItems, amount } = useTransactionRefundContext();

    const allItems: Readonly<ILineItem[]> = useMemo(() => (view === ActiveView.REFUND ? refundItems : lineItems), [view]);

    const itemsWithStatus = useMemo(
        () =>
            allItems.reduce((current: itemsByStatus, item: ILineItem) => {
                const currentValue = current.get('available');
                const valueToAdd = currentValue ? [...currentValue, item] : [item];
                current.set('available', valueToAdd);
                if (item.refundStatuses && item.refundStatuses.length > 0) {
                    item.refundStatuses.map(status => {
                        const statusValue = current.get(status.status);
                        const statusValueToAdd = statusValue
                            ? [...statusValue, { ...item, availableQuantity: status.quantity }]
                            : [{ ...item, availableQuantity: status.quantity }];
                        current.set(status.status, statusValueToAdd);
                    });
                }
                return current;
            }, new Map()),
        [allItems]
    );

    const hasSelectAll = allItems.length > 5;

    const selectAllItems = useCallback<ILineItemRefundData['selectAllItems']>(
        () =>
            refundItems.map(({ id, availableQuantity: quantity, amountIncludingTax: amount }) =>
                updateItems([{ id, amount: amount.value, quantity }])
            ),
        [refundItems, updateItems]
    );

    const allItemsQuantity = useCallback<ILineItemRefundData['allItemsQuantity']>(
        () => refundItems.reduce((current, { availableQuantity }) => current + availableQuantity, 0),
        [refundItems]
    );

    const clearAllItems = useCallback<ILineItemRefundData['selectAllItems']>(
        () => selectedItems.map(({ id }) => clearItems([id])),
        [selectedItems, clearItems]
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            clearAllItems();
        } else {
            selectAllItems();
        }
    };

    const availableItems = itemsWithStatus.get('available') ?? [];
    const failedItems = itemsWithStatus.get('failed') ?? [];
    const refundedItems = itemsWithStatus.get('completed') ?? [];
    const inProgressItems = itemsWithStatus.get('in_progress') ?? [];

    return {
        availableItems,
        failedItems,
        refundedItems,
        inProgressItems,
        hasSelectAll,
        clearAllItems,
        amount,
        allItemsQuantity,
        selectAllItems,
        handleSelectAll,
    };
};

export default useRefundCapabilityData;
