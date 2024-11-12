import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import { boolOrFalse, isFunction } from '../../../../../utils';
import { RefundMode, RefundedState, RefundStatus } from '../../context/types';
import { checkRefundStatusCollection } from './helpers';
import type { IRefundMode } from '../../../../../types';
import type { TransactionDataProps } from '../../types';

export const useTransactionRefundMetadata = (transaction: TransactionDataProps['transaction']) => {
    const details = transaction?.refundDetails;
    const refundMode: IRefundMode = details?.refundMode ?? RefundMode.FULL_AMOUNT;
    const refundLocked = boolOrFalse(details?.refundLocked);
    const refundable = refundMode !== RefundMode.NON_REFUNDABLE;

    const refundableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount.value ?? 0) : 0), [details, transaction]);

    const refundAuthorization = isFunction(useAuthContext().endpoints.refundTransaction);
    const refundAvailable = refundAuthorization && refundable && refundableAmount > 0;
    const refundCurrency = details?.refundableAmount.currency ?? transaction?.amount.currency ?? '';
    const refundDisabled = !refundAvailable || refundLocked;

    // [TODO]: Introduce logic to compute already refunded amount
    const refundedAmount = 0;

    const refundedState = useMemo(() => {
        const { some: someRefunded, every: allRefunded } = checkRefundStatusCollection(
            ({ status }) => status === RefundStatus.COMPLETED,
            details?.refundStatuses
        );

        switch (refundMode) {
            case RefundMode.FULL_AMOUNT:
            case RefundMode.PARTIAL_AMOUNT:
            case RefundMode.PARTIAL_LINE_ITEMS:
                if (refundableAmount === 0 && refundedAmount > 0 && allRefunded) {
                    return RefundedState.FULL;
                }
        }

        switch (refundMode) {
            case RefundMode.PARTIAL_AMOUNT:
            case RefundMode.PARTIAL_LINE_ITEMS:
                if (refundableAmount > 0 && refundedAmount > 0 && someRefunded) {
                    return RefundedState.PARTIAL;
                }
        }

        return RefundedState.INDETERMINATE;
    }, [details, refundableAmount, refundedAmount, refundMode]);

    return {
        refundableAmount, // the maximum amount still available for refund
        refundable, // whether the refund mode of the payment allows for refund
        refundAvailable, // whether a refund can be initiated for the payment
        refundAuthorization, // whether the authenticated user has sufficient permission to initiate refunds
        refundCurrency, // the payment currency for any initiated refund
        refundDisabled, // whether refund action for the payment is disabled (refund view should be prevented)
        refundedAmount, // the total amount already refunded
        refundedState, // whether the payment is yet to be, partially or fully refunded
        refundLocked, // whether refund action for the payment is temporarily locked
        refundMode, // the refund mode of the payment
    } as const;
};

export default useTransactionRefundMetadata;
