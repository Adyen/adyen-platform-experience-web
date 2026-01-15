import refundLockManager from './refundLockManager/refundLockManager';
import { boolOrFalse, isFunction } from '../../../../../utils';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { RefundMode, RefundedState, TransactionDetails } from '../../types';
import { IRefundMode } from '../../../../../types';
import { REFUND_STATUSES } from '../../constants';

export const useRefundMetadata = (transaction?: TransactionDetails) => {
    const transactionId = transaction?.id;
    const refundDetails = transaction?.refundDetails;
    const [locked, setLocked] = useState(() => !!transactionId && refundLockManager.isLocked(transactionId));

    const refundMode: IRefundMode = refundDetails?.refundMode ?? RefundMode.FULL_AMOUNT;
    const refundLockedState = boolOrFalse(refundDetails?.refundLocked);
    const refundLocked = refundLockedState || locked;
    const refundable = refundMode !== RefundMode.NON_REFUNDABLE;

    const refundableAmount = useMemo(
        () => (transaction ? Math.max(0, refundDetails?.refundableAmount?.value ?? 0) : 0),
        [refundDetails, transaction]
    );

    const refundAuthorization = isFunction(useConfigContext().endpoints.initiateRefund);
    const refundAvailable = refundAuthorization && refundable && refundableAmount > 0;
    const refundCurrency = refundDetails?.refundableAmount?.currency ?? transaction?.netAmount.currency ?? '';
    const refundDisabled = !refundAvailable || refundLocked;

    const refundAmounts = useMemo(() => {
        let latestNonFailedRefundIndex = -1;

        return (refundDetails?.refundStatuses ?? []).reduceRight(
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
    }, [refundDetails?.refundStatuses]);

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

    const lockRefund = useCallback(() => {
        if (transactionId) {
            refundLockManager.lock(transactionId);
            setLocked(refundLockManager.isLocked(transactionId));
        }
    }, [transactionId]);

    const cachedRefundLockedState = useRef(refundLockedState);

    useEffect(() => {
        if (transactionId && (cachedRefundLockedState.current = refundLockedState)) {
            // Refund locked status is now active for this transaction
            // Remove the local lock, and rely on the refund locked state
            refundLockManager.unlock(transactionId);
        }

        // Recompute locked state whenever transaction changes
        setLocked(!!transactionId && refundLockManager.isLocked(transactionId));

        refundLockManager.sync();
    }, [refundLockedState, transactionId]);

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
        lockRefund, // locally lock the refund action
    } as const;
};

export default useRefundMetadata;
