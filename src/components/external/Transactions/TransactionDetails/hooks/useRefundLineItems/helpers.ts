import { clamp, EMPTY_ARRAY, isUndefined } from '../../../../../../utils';
import { RefundLineItem, RefundLineItemUpdates } from '../../types';

const _updateRefundItemQuantity = (
    refundableItems: Map<string, RefundLineItem>,
    nextRefundItems: RefundLineItem[],
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
    refundableItems: Map<string, RefundLineItem>,
    currentRefundItems: readonly RefundLineItem[],
    refundItemUpdates = EMPTY_ARRAY as unknown as RefundLineItemUpdates
): readonly RefundLineItem[] => {
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
