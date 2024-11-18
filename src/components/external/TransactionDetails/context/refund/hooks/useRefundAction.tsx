import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import AuthSession from '../../../../../../core/Auth/session/AuthSession';
import Spinner from '../../../../../internal/Spinner';
import { ActiveView } from '../../types';
import type { ITransactionRefundContext, TransactionRefundProviderProps } from '../types';
import type { ITransaction, ITransactionRefundPayload } from '../../../../../../types';

type _BaseUseRefundActionProps = Pick<TransactionRefundProviderProps, 'refreshTransaction' | 'transactionId'> &
    Pick<ITransactionRefundContext, 'refundReason'> & {
        refundAmount: ITransaction['amount'];
        refundInProgress: boolean;
        refundTransaction: AuthSession['context']['endpoints']['refundTransaction'];
        setActiveView: (activeView: ActiveView) => void;
    };

export const useRefundAction = <T extends _BaseUseRefundActionProps>({
    refreshTransaction,
    refundAmount: amount,
    refundReason,
    refundInProgress,
    refundTransaction,
    setActiveView,
    transactionId,
}: T) => {
    const { i18n } = useCoreContext();

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
            renderTitle: (title: string) => (
                <>
                    <Spinner size={'small'} />
                    {title}
                </>
            ),
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
                    setActiveView(ActiveView.REFUND_SUCCESS);
                })
                .catch(() => {
                    setActiveView(ActiveView.REFUND_ERROR);
                }),
        [refreshTransaction, refundTransaction, refundParams, refundPayload, setActiveView, refreshTransaction]
    );

    const refundActionLabel = useMemo(() => {
        if (refundInProgress) return refundingPaymentLabel;
        if (amount.value > 0) return refundAmountLabel;
        return refundPaymentLabel;
    }, [amount, refundInProgress, refundAmountLabel, refundPaymentLabel, refundingPaymentLabel]);

    return { refundAction, refundActionLabel } as const;
};
