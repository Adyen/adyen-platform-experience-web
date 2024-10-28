import { clamp, EMPTY_ARRAY, isUndefined } from '../../../../../utils';
import type { ITransactionRefundContext, TransactionRefundItem, TransactionRefundItemUpdates } from './types';

const _updateRefundItemQuantity = (
    refundableItems: Map<string, TransactionRefundItem>,
    nextRefundItems: ITransactionRefundContext['items'][number][],
    refundItem: { reference: string; quantity: number },
    refundQuantity = 0
) => {
    const { ...refundableItem } = refundableItems.get(refundItem.reference)!;
    const quantity = clamp(0, Math.trunc(refundQuantity), (refundableItem.quantity += refundItem.quantity));

    refundableItem.quantity -= quantity;
    refundableItems.set(refundItem.reference, Object.freeze(refundableItem));

    if (quantity > 0) nextRefundItems.push(Object.freeze({ ...refundableItem, quantity }));
};

export const updateRefundItems = (
    refundableItems: Map<string, TransactionRefundItem>,
    currentRefundItems: ITransactionRefundContext['items'],
    refundItemUpdates = EMPTY_ARRAY as unknown as TransactionRefundItemUpdates
): ITransactionRefundContext['items'] => {
    const refundQuantities = new Map(refundItemUpdates?.map(({ reference, quantity }) => [reference, quantity]) ?? EMPTY_ARRAY);
    const nextRefundItems = [] as (typeof currentRefundItems)[number][];

    currentRefundItems.forEach(item => {
        const refundQuantity = refundQuantities.get(item.reference);

        if (isUndefined(refundQuantity)) {
            nextRefundItems.push(item);
        } else if (refundQuantities.delete(item.reference)) {
            _updateRefundItemQuantity(refundableItems, nextRefundItems, item, refundQuantity);
        }
    });

    refundQuantities.forEach((refundQuantity, reference) => {
        _updateRefundItemQuantity(refundableItems, nextRefundItems, { reference, quantity: 0 }, refundQuantity);
    });

    return nextRefundItems.length > 0 ? Object.freeze(nextRefundItems) : EMPTY_ARRAY;
};
