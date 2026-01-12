import cx from 'classnames';
import { useEffect, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { RefundReason, RefundResult } from '../../types';
import { ButtonVariant } from '../../../../../internal/Button/types';
import { ButtonActionsLayoutBasic } from '../../../../../internal/Button/ButtonActions/types';
import { TX_DATA_ACTION_BAR, TX_DATA_CONTAINER, sharedTransactionDetailsEventProperties } from '../../constants';
import ButtonActions from '../../../../../internal/Button/ButtonActions/ButtonActions';
import useAnalyticsContext from '../../../../../../core/Context/analytics/useAnalyticsContext';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

export interface PaymentRefundActionsProps {
    beginRefund: () => void;
    currency: string;
    disabled: boolean;
    maxAmount: number;
    refundAmount: number;
    refundedAmount: number;
    refundingAmounts: readonly number[];
    refundReason: RefundReason;
    setRefundInProgress: (inProgress: boolean) => void;
    setRefundResult: (result: RefundResult) => void;
    showDetails: () => void;
    transactionId: string;
}

const PaymentRefundActions = ({
    beginRefund,
    currency,
    disabled,
    maxAmount,
    refundAmount,
    refundedAmount,
    refundingAmounts,
    refundReason,
    setRefundInProgress,
    setRefundResult,
    showDetails,
    transactionId,
}: PaymentRefundActionsProps) => {
    const { initiateRefund } = useConfigContext().endpoints;
    const { isLoading, mutate: refundTransaction } = useMutation({ queryFn: initiateRefund });
    const { i18n } = useCoreContext();

    const amountWithinRange = refundAmount > 0 && refundAmount <= maxAmount;
    const isFullRefundAmount = refundedAmount === 0 && refundingAmounts.length === 0 && refundAmount === maxAmount;
    const refundDisabled = disabled || isLoading || !amountWithinRange;

    const backButtonLabel = useMemo(() => i18n.get('transactions.details.refund.actions.back'), [i18n]);

    const refundButtonLabelsWithoutAmount = useMemo(
        () => ({
            idle: i18n.get('transactions.details.refund.actions.refund.labels.payment'),
            inProgress: `${i18n.get('transactions.details.refund.actions.refund.labels.inProgress')}..`,
        }),
        [i18n]
    );

    const refundButtonLabelWithAmount = useMemo(() => {
        const values = { amount: i18n.amount(refundAmount, currency) };
        return i18n.get('transactions.details.refund.actions.refund.labels.amount', { values });
    }, [i18n, currency, refundAmount]);

    const refundButtonLabel = isLoading
        ? refundButtonLabelsWithoutAmount.inProgress
        : amountWithinRange
          ? refundButtonLabelWithAmount
          : refundButtonLabelsWithoutAmount.idle;

    const userEvents = useAnalyticsContext();

    const primaryAction = {
        disabled: refundDisabled,
        event: async () => {
            if (refundDisabled) return;

            beginRefund();

            userEvents.addEvent?.('Completed refund', {
                ...sharedTransactionDetailsEventProperties,
                isFullRefund: isFullRefundAmount,
                refundReason,
            });

            try {
                const path = { transactionId };
                const payload = { amount: { currency, value: refundAmount }, refundReason };
                await refundTransaction({ contentType: 'application/json', body: payload }, { path });
                setRefundResult('done');
            } catch {
                setRefundResult('error');
            }
        },
        state: isLoading ? 'loading' : undefined,
        title: refundButtonLabel,
        variant: ButtonVariant.PRIMARY,
        ariaLabel: isLoading ? refundButtonLabelWithAmount : refundButtonLabel,
    } as const;

    const secondaryAction = {
        disabled: disabled,
        event: showDetails,
        title: backButtonLabel,
        variant: ButtonVariant.SECONDARY,
    } as const;

    useEffect(() => setRefundInProgress(isLoading), [isLoading, setRefundInProgress]);

    return (
        <div className={cx(TX_DATA_CONTAINER, TX_DATA_ACTION_BAR)}>
            <ButtonActions actions={[primaryAction, secondaryAction]} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
        </div>
    );
};

export default PaymentRefundActions;
