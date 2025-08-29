import { useCallback, useMemo } from 'preact/hooks';
import useAnalyticsContext from '../../../../../../core/Context/analytics/useAnalyticsContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import AuthSession from '../../../../../../core/ConfigContext/session/AuthSession';
import { ActiveView } from '../../types';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from '../types';
import type { ITransaction, ITransactionRefundPayload } from '../../../../../../types';

type _BaseUseRefundActionProps = Pick<TransactionRefundProviderProps, 'refreshTransaction' | 'transactionId'> &
    Pick<ITransactionRefundContext, 'refundReason'> & {
        availableAmount: number;
        refundAmount: ITransaction['amount'];
        refundInProgress: boolean;
        refundTransaction: AuthSession['context']['endpoints']['initiateRefund'];
        setActiveView: (activeView: ActiveView) => void;
    };

export const useRefundAction = <T extends _BaseUseRefundActionProps>({
    availableAmount,
    refundAmount: amount,
    refundReason,
    refundInProgress,
    refundTransaction,
    setActiveView,
    transactionId,
}: T) => {
    const { i18n } = useCoreContext();
    const userEvents = useAnalyticsContext();

    const refundAmountLabel = useMemo(() => {
        const formattedAmount = i18n.amount(amount.value, amount.currency);
        return { title: i18n.get('refundPayment', { values: { amount: formattedAmount } }) };
    }, [amount, i18n]);

    const refundPaymentLabel = useMemo(() => {
        return { title: i18n.get('refundAction') };
    }, [i18n]);
    const refundingPaymentLabel = useMemo(
        () => ({
            title: `${i18n.get('inProgress')}..`,
            state: 'loading',
        }),
        [i18n]
    );

    const refundParams = useMemo(
        () => ({
            path: { transactionId },
        }),
        [transactionId]
    );

    const refundPayload = useMemo<ITransactionRefundPayload>(
        () => ({
            amount,
            refundReason,
            // ...(refundMode === RefundMode.PARTIAL_LINE_ITEMS && { lineItems: [] }),
        }),
        [amount, refundReason]
    );

    const isFullAmount = useMemo(() => availableAmount === amount.value, [availableAmount, amount]);

    const refundAction = useCallback(
        // [TODO]: Fix broken/missing type inference for useMutation mutate()
        () =>
            refundTransaction?.(
                {
                    body: refundPayload,
                    contentType: 'application/json',
                },
                refundParams
            )
                .then(() => {
                    userEvents.addEvent('Completed refund', {
                        refundReason: refundReason,
                        isFullRefund: isFullAmount,
                        category: 'Transaction component',
                        subCategory: 'Transaction details',
                    });
                    setActiveView(ActiveView.REFUND_SUCCESS);
                })
                .catch(() => {
                    setActiveView(ActiveView.REFUND_ERROR);
                }),
        [isFullAmount, refundTransaction, refundParams, refundPayload, refundReason, setActiveView, userEvents]
    );

    const refundActionLabel = useMemo(() => {
        if (refundInProgress) return refundingPaymentLabel;
        if (amount.value > 0) return refundAmountLabel;
        return refundPaymentLabel;
    }, [amount, refundInProgress, refundAmountLabel, refundPaymentLabel, refundingPaymentLabel]);

    return { refundAction, refundActionLabel } as const;
};
