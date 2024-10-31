import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import AuthSession from '../../../../../../core/Auth/session/AuthSession';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from '../types';
import type { ITransaction, ITransactionRefundPayload } from '../../../../../../types';

type _BaseUseRefundActionProps = Pick<TransactionRefundProviderProps, 'transactionId'> &
    Pick<ITransactionRefundContext, 'refundReason'> & {
        refundAmount: ITransaction['amount'];
        refundInProgress: boolean;
        refundTransaction: AuthSession['context']['endpoints']['refundTransaction'];
    };

export const useRefundAction = <T extends _BaseUseRefundActionProps>({
    refundAmount: amount,
    refundReason: merchantRefundReason,
    refundInProgress,
    refundTransaction,
    transactionId,
}: T) => {
    const { i18n } = useCoreContext();

    const refundAmountLabel = useMemo(() => {
        const formattedAmount = i18n.amount(amount.value, amount.currency);
        return i18n.get('refundPayment', { values: { amount: formattedAmount } });
    }, [amount, i18n]);

    const refundPaymentLabel = useMemo(() => i18n.get('refundAction'), [i18n]);
    const refundingPaymentLabel = useMemo(() => `${i18n.get('refundingPayment')}..`, [i18n]);

    const refundParams = useMemo(
        () => ({
            path: { transactionId },
        }),
        [transactionId]
    );

    const refundPayload = useMemo<ITransactionRefundPayload>(
        () => ({
            amount,
            merchantRefundReason,
            // ...(refundMode === RefundMode.PARTIAL_LINE_ITEMS && { lineItems: [] }),
        }),
        [amount, merchantRefundReason]
    );

    const refundAction = useCallback(
        // [TODO]: Fix broken/missing type inference for useMutation mutate()
        () =>
            void refundTransaction?.(
                {
                    body: refundPayload,
                    contentType: 'application/json',
                },
                refundParams
            ),
        [refundTransaction, refundParams, refundPayload]
    );

    const refundActionLabel = useMemo(() => {
        if (refundInProgress) return refundingPaymentLabel;
        if (amount.value > 0) return refundAmountLabel;
        return refundPaymentLabel;
    }, [amount, refundInProgress, refundAmountLabel, refundPaymentLabel, refundingPaymentLabel]);

    return { refundAction, refundActionLabel } as const;
};
