import { useMemo } from 'preact/hooks';
import { boolOrFalse, isFunction } from '../../../../../../utils';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { RefundMode, RefundedState, TransactionDetails } from '../../types';
import { IRefundMode } from '../../../../../../types';
import { REFUND_STATUSES } from '../../constants';

export const useRefundMetadata = (transaction?: TransactionDetails) => {
    const details = transaction?.refundDetails;
    const refundMode: IRefundMode = details?.refundMode ?? RefundMode.FULL_AMOUNT;
    const refundLocked = boolOrFalse(details?.refundLocked);
    const refundable = refundMode !== RefundMode.NON_REFUNDABLE;

    const refundableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount?.value ?? 0) : 0), [details, transaction]);

    const refundAuthorization = isFunction(useConfigContext().endpoints.initiateRefund);
    const refundAvailable = refundAuthorization && refundable && refundableAmount > 0;
    const refundCurrency = details?.refundableAmount?.currency ?? transaction?.netAmount.currency ?? '';
    const refundDisabled = !refundAvailable || refundLocked;

    const refundAmounts = useMemo(() => {
        let latestNonFailedRefundIndex = -1;

        return (details?.refundStatuses ?? []).reduceRight(
            (refundAmounts, { amount, status }, index) => {
                if (amount.value !== 0 && REFUND_STATUSES.includes(status)) {
                    const isNonFailedRefund = status !== 'failed';
                    const isMoreRecentRefund = index > latestNonFailedRefundIndex;

                    if (isNonFailedRefund && isMoreRecentRefund) {
                        latestNonFailedRefundIndex = index;
                    }

                    if (isNonFailedRefund || isMoreRecentRefund) {
                        const updatedStatusAmounts = (refundAmounts[status] ?? []).concat(Math.abs(amount.value));
                        return { ...refundAmounts, [status]: updatedStatusAmounts };
                    }
                }
                return refundAmounts;
            },
            {} as Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>
        );
    }, [details?.refundStatuses]);

    const { fullRefundFailed, fullRefundInProgress, refundedAmount } = useMemo(() => {
        let fullRefundFailed = false;
        let fullRefundInProgress = false;

        const refundedAmount = (refundAmounts.completed ?? []).reduce((sum, amount) => sum + amount, 0);
        const refundingAmounts = refundAmounts.in_progress ?? [];
        const failedRefundAmounts = refundAmounts.failed ?? [];

        if (refundedAmount === 0) {
            fullRefundFailed = refundingAmounts.length === 0 && failedRefundAmounts.slice(-1)[0] === refundableAmount;
            fullRefundInProgress = refundingAmounts.length === 1 && refundingAmounts[0] === refundableAmount;
        }

        return { fullRefundFailed, fullRefundInProgress, refundedAmount } as const;
    }, [refundableAmount, refundAmounts]);

    const refundedState = useMemo(() => {
        if (refundedAmount > 0) {
            switch (refundMode) {
                case RefundMode.NON_REFUNDABLE:
                    if (refundableAmount === 0) return RefundedState.FULL;
                    break;
                case RefundMode.PARTIAL_AMOUNT:
                case RefundMode.PARTIAL_LINE_ITEMS:
                    if (refundableAmount > 0) return RefundedState.PARTIAL;
                    break;
            }
        }
        return RefundedState.INDETERMINATE;
    }, [refundableAmount, refundedAmount, refundMode]);

    return {
        fullRefundFailed, // whether the last (and only) refund that failed is the full refundable amount
        fullRefundInProgress, // whether the only refund in progress is the full refundable amount
        refundableAmount, // the maximum amount still available for refund
        refundable, // whether the refund mode of the payment allows for refund
        refundAvailable, // whether a refund can be initiated for the payment
        refundAuthorization, // whether the authenticated user has sufficient permission to initiate refunds
        refundCurrency, // the payment currency for any initiated refund
        refundDisabled, // whether refund action for the payment is disabled (refund view should be prevented)
        refundAmounts, // lookup of refund amounts by refund statuses
        refundedAmount, // the total amount already refunded
        refundedState, // whether the payment is yet to be, partially or fully refunded
        refundLocked, // whether refund action for the payment is temporarily locked
        refundMode, // the refund mode of the payment
    } as const;
};

export default useRefundMetadata;
