import { ILineItem } from '../../../../../../types';
import { EMPTY_ARRAY } from '../../../../../../utils';
import { RefundLineItem, RefundLineItemUpdates } from '../../types';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { updateRefundItems } from './helpers';

export interface UseRefundLineItemsProps {
    lineItems: readonly ILineItem[];
    currency: string;
}

export const useRefundLineItems = <T extends UseRefundLineItemsProps>({ currency, lineItems }: T) => {
    const [refundingItems, setRefundingItems] = useState(EMPTY_ARRAY as readonly RefundLineItem[]);

    const refundableItems = useMemo(() => {
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

        return new Map<string, RefundLineItem>(items ?? EMPTY_ARRAY);
    }, [currency, lineItems]);

    const availableItems = useMemo<readonly ILineItem[]>(
        () => lineItems?.filter(({ id }) => refundableItems.has(id)) ?? EMPTY_ARRAY,
        [lineItems, refundableItems, refundingItems]
    );

    const clearItems = useCallback(
        function (ids?: RefundLineItem['id'][]) {
            setRefundingItems(items => {
                // prettier-ignore
                const _items = arguments.length === 0
                    ? new Map(items.map(({ id }) => [id, 0]))
                    : new Map(ids?.map(id => [id, 0]) ?? EMPTY_ARRAY);

                const itemUpdates = [..._items].map(([id, quantity]) => ({ id, quantity }) as const);
                return updateRefundItems(refundableItems, items, itemUpdates);
            });
        },
        [refundableItems]
    );

    const updateItems = useCallback(
        (itemUpdates?: RefundLineItemUpdates) => setRefundingItems(items => updateRefundItems(refundableItems, items, itemUpdates)),
        [refundableItems]
    );

    return { availableItems, clearItems, refundingItems, updateItems } as const;
};

export default useRefundLineItems;
