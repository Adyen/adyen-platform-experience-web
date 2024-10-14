import { memo } from 'preact/compat';
import { createContext, toChildArray } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { EMPTY_ARRAY, noop } from '../../../../../utils';
import { FULLY_REFUNDABLE_ONLY, REFUND_REASONS } from '../constants';
import { getRefundableItemsForTransactionLineItems, getRefundAmountByMode, updateRefundItems } from './helpers';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from './types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ActiveView } from '../types';

const TransactionRefundContext = createContext<ITransactionRefundContext>({
    amount: 0,
    availableAmount: 0,
    availableItems: EMPTY_ARRAY,
    clearItems: noop,
    currency: '',
    items: EMPTY_ARRAY,
    primaryAction: noop,
    refundMode: FULLY_REFUNDABLE_ONLY,
    refundReason: REFUND_REASONS[0],
    refundReference: void 0,
    secondaryAction: noop,
    setAmount: noop,
    setRefundReason: noop,
    setRefundReference: noop,
    updateItems: noop,
});

export const TransactionRefundProvider = memo(
    ({
        availableAmount,
        children,
        currency,
        lineItems,
        refundAmount,
        refundReason,
        refundReference,
        refundMode,
        setActiveView,
        setAmount,
        setPrimaryAction,
        setRefundReason,
        setRefundReference,
        setSecondaryAction,
    }: TransactionRefundProviderProps) => {
        const { i18n } = useCoreContext();
        const [items, setItems] = useState(EMPTY_ARRAY as ITransactionRefundContext['items']);

        const amount = useMemo(
            () => getRefundAmountByMode(refundMode, availableAmount, items, refundAmount),
            [availableAmount, items, refundMode, refundAmount]
        );

        const refundableItems = useMemo(() => getRefundableItemsForTransactionLineItems(currency, lineItems), [currency, lineItems]);

        const availableItems = useMemo<ITransactionRefundContext['availableItems']>(
            () => lineItems?.filter(({ id }) => refundableItems.has(id)) ?? EMPTY_ARRAY,
            [items, lineItems, refundableItems]
        );

        const clearItems = useCallback<ITransactionRefundContext['clearItems']>(
            function (ids) {
                setItems(items => {
                    const _items = arguments.length === 0 ? new Map(items.map(({ id }) => [id, 0])) : new Map(ids?.map(id => [id, 0]) ?? EMPTY_ARRAY);

                    const itemUpdates = [..._items].map(([id, quantity]) => ({ id, quantity } as const));
                    return updateRefundItems(refundableItems, items, itemUpdates);
                });
            },
            [refundableItems]
        );

        const updateItems = useCallback<ITransactionRefundContext['updateItems']>(
            itemUpdates => {
                setItems(items => updateRefundItems(refundableItems, items, itemUpdates));
            },
            [refundableItems]
        );

        const secondaryAction = useCallback(() => {
            setActiveView(ActiveView.DETAILS);
        }, [setActiveView]);

        const primaryAction = useCallback(noop, []);

        useEffect(() => {
            setPrimaryAction(
                Object.freeze({
                    disabled: amount <= 0,
                    event: primaryAction,
                    title: i18n.get('refundAction'),
                    variant: ButtonVariant.PRIMARY,
                })
            );
        }, [amount, i18n, primaryAction, setPrimaryAction]);

        useEffect(() => {
            setSecondaryAction(
                Object.freeze({
                    disabled: false,
                    event: secondaryAction,
                    title: i18n.get('closeIconLabel'),
                    variant: ButtonVariant.SECONDARY,
                })
            );
        }, [i18n, secondaryAction, setSecondaryAction]);

        return (
            <TransactionRefundContext.Provider
                value={{
                    amount,
                    availableAmount,
                    availableItems,
                    clearItems,
                    currency,
                    items,
                    primaryAction,
                    refundMode,
                    refundReason,
                    refundReference,
                    secondaryAction,
                    setAmount,
                    setRefundReason,
                    setRefundReference,
                    updateItems,
                }}
            >
                {toChildArray(children)}
            </TransactionRefundContext.Provider>
        );
    }
);

export const useTransactionRefundContext = () => useContext(TransactionRefundContext);
export default useTransactionRefundContext;
