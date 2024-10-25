import { memo } from 'preact/compat';
import { createContext } from 'preact';
import { REFUND_REASONS } from '../constants';
import { useCallback, useContext, useEffect, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useAuthContext } from '../../../../../core/Auth';
import { clamp, EMPTY_ARRAY, noop } from '../../../../../utils';
import { getRefundableItemsForTransactionLineItems, getRefundAmountByMode, updateRefundItems } from './helpers';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from './types';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ActiveView, RefundMode, type RefundReason } from '../types';

const TransactionRefundContext = createContext<ITransactionRefundContext>({
    amount: 0,
    availableAmount: 0,
    availableItems: EMPTY_ARRAY,
    clearItems: noop,
    currency: '',
    items: EMPTY_ARRAY,
    primaryAction: noop,
    refundMode: RefundMode.FULL_AMOUNT,
    refundReason: REFUND_REASONS[0],
    secondaryAction: noop,
    setAmount: noop,
    setRefundReason: noop,
    transactionId: '',
    updateItems: noop,
});

export const TransactionRefundProvider = memo(
    ({
        availableAmount,
        children,
        currency,
        lineItems,
        refundMode,
        setActiveView,
        setPrimaryAction,
        setSecondaryAction,
        transactionId,
    }: TransactionRefundProviderProps) => {
        const { i18n } = useCoreContext();
        const [items, setItems] = useState(EMPTY_ARRAY as ITransactionRefundContext['items']);
        const [refundReason, setReason] = useState<RefundReason>(REFUND_REASONS[0]);
        const [refundAmount, setRefundAmount] = useState(0);

        const amount = useMemo(
            () => getRefundAmountByMode(refundMode, availableAmount, items, refundAmount),
            [availableAmount, items, refundMode, refundAmount]
        );

        const setAmount = useCallback<ITransactionRefundContext['setAmount']>(
            amount => void (refundMode === RefundMode.PARTIAL_AMOUNT && setRefundAmount(clamp(0, amount, availableAmount))),
            [availableAmount, refundMode]
        );

        const formattedAmount = i18n.amount(amount, currency);
        const refundableItems = useMemo(() => getRefundableItemsForTransactionLineItems(currency, lineItems), [currency, lineItems]);

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

        const setRefundReason = useCallback<ITransactionRefundContext['setRefundReason']>(
            // [TODO]: Skip refund mode check here and use the `refundable` property from `useTransactionRefundMetadata`
            reason => void (refundMode !== RefundMode.NON_REFUNDABLE && setReason(reason)),
            [refundMode]
        );

        const { mutate: refundTransaction } = useMutation({ queryFn: useAuthContext().endpoints.refundTransaction });
        const secondaryAction = useCallback(() => setActiveView(ActiveView.DETAILS), [setActiveView]);

        const primaryAction = useCallback(async () => {
            // [TODO]: Fix broken/missing type inference for useMutation mutate()
            await refundTransaction(
                {
                    body: {
                        amount: { currency, value: amount },
                        merchantRefundReason: i18n.get(refundReason),
                        ...(refundMode === RefundMode.PARTIAL_LINE_ITEMS && {
                            lineItems: [],
                        }),
                    },
                    contentType: 'application/json',
                },
                {
                    path: { transactionId },
                }
            );
        }, [amount, currency, i18n, refundMode, refundReason, refundTransaction, transactionId]);

        useEffect(() => {
            setRefundAmount(availableAmount);
        }, [availableAmount]);

        useEffect(() => {
            setPrimaryAction(
                Object.freeze({
                    disabled: amount <= 0,
                    event: primaryAction,
                    title: amount > 0 ? i18n.get('refundPayment', { values: { amount: formattedAmount } }) : i18n.get('refundAction'),
                    variant: ButtonVariant.PRIMARY,
                })
            );
        }, [amount, formattedAmount, i18n, primaryAction, setPrimaryAction]);

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
                    secondaryAction,
                    setAmount,
                    setRefundReason,
                    transactionId,
                    updateItems,
                }}
            >
                {children}
            </TransactionRefundContext.Provider>
        );
    }
);

export const useTransactionRefundContext = () => useContext(TransactionRefundContext);
export default useTransactionRefundContext;
