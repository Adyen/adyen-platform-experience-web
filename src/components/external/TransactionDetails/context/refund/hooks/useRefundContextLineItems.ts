import { EMPTY_ARRAY } from '../../../../../../utils';
import { updateRefundItems } from '../helpers';
import { useCallback, useMemo, useState } from 'preact/hooks';
import type { ITransactionRefundContext, TransactionRefundItem, TransactionRefundProviderProps } from '../types';

type _BaseUseRefundContextLineItemsProps = Pick<TransactionRefundProviderProps, 'currency' | 'lineItems'>;

export const useRefundContextLineItems = <T extends _BaseUseRefundContextLineItemsProps>({ currency, lineItems }: T) => {
    const [items, setItems] = useState(EMPTY_ARRAY as ITransactionRefundContext['items']);

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

        return new Map<string, TransactionRefundItem>(items ?? EMPTY_ARRAY);
    }, [currency, lineItems]);

    const availableItems = useMemo<ITransactionRefundContext['availableItems']>(
        () => lineItems?.filter(({ id }) => refundableItems.has(id)) ?? EMPTY_ARRAY,
        [items, lineItems, refundableItems]
    );

    const clearItems = useCallback<ITransactionRefundContext['clearItems']>(
        function (ids) {
            setItems(items => {
                // prettier-ignore
                const _items = arguments.length === 0
                    ? new Map(items.map(({ id }) => [id, 0]))
                    : new Map(ids?.map(id => [id, 0]) ?? EMPTY_ARRAY);

                const itemUpdates = [..._items].map(([id, quantity]) => ({ id, quantity } as const));
                return updateRefundItems(refundableItems, items, itemUpdates);
            });
        },
        [refundableItems]
    );

    const updateItems = useCallback<ITransactionRefundContext['updateItems']>(
        itemUpdates => setItems(items => updateRefundItems(refundableItems, items, itemUpdates)),
        [refundableItems]
    );

    return { availableItems, clearItems, items, updateItems } as const;
};
