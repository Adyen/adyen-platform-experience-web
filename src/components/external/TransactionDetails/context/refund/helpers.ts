import { clamp, EMPTY_ARRAY, isUndefined } from '../../../../../utils';
import type { ITransactionRefundContext, TransactionRefundItem, TransactionRefundItemUpdates } from './types';
import type { ILineItem, ITransactionRefundMode } from '../../../../../types';
import { RefundMode } from '../types';

export const getRefundableItemsForTransactionLineItems = (currency = '', lineItems?: readonly ILineItem[] | ILineItem[]) => {
    const items = lineItems
        ?.filter(item => {
            if (item.amountIncludingTax.currency !== currency) return;
            const qty = item.availableQuantity;
            return qty > 0 && Number.isFinite(qty) && Math.trunc(qty) === qty;
        })
        .map(
            ({ id, ...item }) =>
                [
                    id,
                    Object.freeze({
                        amount: item.amountIncludingTax.value,
                        quantity: item.availableQuantity,
                        id,
                    }),
                ] as const
        );

    return new Map<string, TransactionRefundItem>(items ?? EMPTY_ARRAY);
};

export const getRefundAmountByMode = (
    refundMode: ITransactionRefundMode,
    refundableAmount: number,
    refundItems = EMPTY_ARRAY as ITransactionRefundContext['items'],
    partialRefundAmount = 0
): number => {
    switch (refundMode) {
        case RefundMode.NONE:
            return 0;
        case RefundMode.PARTIAL_AMOUNT:
            return partialRefundAmount;
        case RefundMode.PARTIAL_LINE_ITEMS:
            return refundItems.reduce((total, { amount, quantity }) => total + amount * quantity, 0);
        case RefundMode.FULL_AMOUNT:
        default:
            return refundableAmount;
    }
};

const _updateRefundItemQuantity = (
    refundableItems: Map<string, TransactionRefundItem>,
    nextRefundItems: ITransactionRefundContext['items'][number][],
    refundItem: { id: string; quantity: number },
    refundQuantity = 0
) => {
    const { ...refundableItem } = refundableItems.get(refundItem.id)!;
    const quantity = clamp(0, Math.trunc(refundQuantity), (refundableItem.quantity += refundItem.quantity));

    refundableItem.quantity -= quantity;
    refundableItems.set(refundItem.id, Object.freeze(refundableItem));

    if (quantity > 0) nextRefundItems.push(Object.freeze({ ...refundableItem, quantity }));
};

export const updateRefundItems = (
    refundableItems: Map<string, TransactionRefundItem>,
    currentRefundItems: ITransactionRefundContext['items'],
    refundItemUpdates = EMPTY_ARRAY as unknown as TransactionRefundItemUpdates
): ITransactionRefundContext['items'] => {
    const refundQuantities = new Map(refundItemUpdates?.map(({ id, quantity }) => [id, quantity]) ?? EMPTY_ARRAY);
    const nextRefundItems = [] as (typeof currentRefundItems)[number][];

    currentRefundItems.forEach(item => {
        const refundQuantity = refundQuantities.get(item.id);

        if (isUndefined(refundQuantity)) {
            nextRefundItems.push(item);
        } else if (refundQuantities.delete(item.id)) {
            _updateRefundItemQuantity(refundableItems, nextRefundItems, item, refundQuantity);
        }
    });

    refundQuantities.forEach((refundQuantity, id) => {
        _updateRefundItemQuantity(refundableItems, nextRefundItems, { id, quantity: 0 }, refundQuantity);
    });

    return nextRefundItems.length > 0 ? Object.freeze(nextRefundItems) : EMPTY_ARRAY;
};
