import { memo } from 'preact/compat';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { EMPTY_ARRAY, noop } from '../../../../../utils';
import { REFUND_REASONS } from '../constants';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useRefundContextActions } from './hooks/useRefundContextActions';
import { useRefundContextAmount } from './hooks/useRefundContextAmount';
import { useRefundContextLineItems } from './hooks/useRefundContextLineItems';
import { useRefundContextReason } from './hooks/useRefundContextReason';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from './types';
import { RefundMode } from '../types';

const TransactionRefundContext = createContext<ITransactionRefundContext>({
    amount: 0,
    availableAmount: 0,
    availableItems: EMPTY_ARRAY,
    clearItems: noop,
    currency: '',
    interactionsDisabled: false,
    items: EMPTY_ARRAY,
    primaryAction: noop,
    refundMode: RefundMode.FULL_AMOUNT,
    refundReason: REFUND_REASONS[0],
    secondaryAction: noop,
    setAmount: noop,
    setRefundReason: noop,
    transactionId: '',
    updateItems: noop,
    transactionOriginalAmount: undefined,
});

export const TransactionRefundProvider = memo(
    ({
        availableAmount,
        children,
        currency,
        lineItems,
        refreshTransaction,
        refundMode,
        setActiveView,
        setPrimaryAction,
        setSecondaryAction,
        transactionId,
        transactionOriginalAmount,
    }: TransactionRefundProviderProps) => {
        const { isLoading: refundInProgress, mutate: refundTransaction } = useMutation({
            queryFn: useConfigContext().endpoints.initiateRefund,
        });
        const { availableItems, clearItems, items, updateItems } = useRefundContextLineItems({ currency, lineItems });
        const interactionsDisabled = refundInProgress;
        const [refundAmount, setAmount] = useRefundContextAmount({ availableAmount, currency, interactionsDisabled, items, refundMode });
        const [refundReason, setRefundReason] = useRefundContextReason({ interactionsDisabled, refundMode });
        const { value: amount } = refundAmount;

        const { primaryAction, secondaryAction } = useRefundContextActions({
            interactionsDisabled,
            refreshTransaction,
            availableAmount,
            refundAmount,
            refundInProgress,
            refundReason,
            refundTransaction,
            setActiveView,
            setPrimaryAction,
            setSecondaryAction,
            transactionId,
            transactionOriginalAmount,
        });

        return (
            <TransactionRefundContext.Provider
                value={{
                    amount,
                    availableAmount,
                    availableItems,
                    clearItems,
                    currency,
                    interactionsDisabled,
                    items,
                    primaryAction,
                    refundMode,
                    refundReason,
                    secondaryAction,
                    setAmount,
                    setRefundReason,
                    transactionId,
                    updateItems,
                    transactionOriginalAmount,
                }}
            >
                {children}
            </TransactionRefundContext.Provider>
        );
    }
);

export const useTransactionRefundContext = () => useContext(TransactionRefundContext);
export default useTransactionRefundContext;
