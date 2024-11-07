import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { boolOrFalse, isFunction } from '../../../../../utils';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import { RefundMode, RefundedState, RefundStatus } from '../../context/types';
import { checkRefundStatusCollection } from './helpers';
import type { IRefundMode } from '../../../../../types';
import type { TransactionDataProps } from '../../types';

export const useTransactionRefundMetadata = (transaction: TransactionDataProps['transaction']) => {
    const { i18n } = useCoreContext();

    const details = transaction?.refundDetails;
    const refundMode: IRefundMode = details?.refundMode ?? RefundMode.FULL_AMOUNT;
    const refundLocked = boolOrFalse(details?.refundLocked);
    const refundable = refundMode !== RefundMode.NON_REFUNDABLE;

    const refundableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount?.value ?? 0) : 0), [details, transaction]);

    const refundAuthorization = isFunction(useAuthContext().endpoints.initiateRefund);
    const refundAvailable = refundAuthorization && refundable && refundableAmount > 0;
    const refundCurrency = details?.refundableAmount?.currency ?? transaction?.amount.currency ?? '';
    const refundDisabled = !refundAvailable || refundLocked;

    // [TODO]: Introduce logic to compute already refunded amount
    const refundedAmount = useMemo(() => {
        const completedRefund = transaction?.refundDetails?.refundStatuses?.find(statusItem => statusItem.status === RefundStatus.COMPLETED);
        //TODO: make the change sign logic util
        return completedRefund ? Math.max(0, ~completedRefund?.amount.value + 1 ?? 0) : 0;
    }, [transaction]);

    const refundStatuses = useMemo(() => {
        const statuses = transaction?.refundDetails?.refundStatuses ?? [];
        const { some: someRefunded, every: allRefunded } = checkRefundStatusCollection(
            ({ status }) => status === RefundStatus.COMPLETED,
            details?.refundStatuses
        );

        const statusAlerts = [];

        if (allRefunded && refundableAmount === 0 && refundedAmount > 0) {
            //TODO: Add those as translation
            statusAlerts.push({ type: AlertTypeOption.HIGHLIGHT, label: `The full amount has been refunded back to the customer.` });
        } else {
            statuses
                ?.filter(currentStatus => currentStatus.amount.value !== 0)
                .forEach(currentStatus => {
                    const { status, amount } = currentStatus;
                    const value = ~amount.value + 1;
                    switch (status) {
                        case RefundStatus.COMPLETED:
                            //TODO: Add those as translation
                            statusAlerts.push({
                                type: AlertTypeOption.HIGHLIGHT,
                                label: `You already refunded ${i18n.amount(value, amount.currency)} the remaining balance is ${i18n.amount(
                                    refundableAmount,
                                    refundCurrency
                                )}`,
                            });
                            return;
                        case RefundStatus.IN_PROGRESS:
                            statusAlerts.push({
                                type: AlertTypeOption.HIGHLIGHT,
                                label: `The partial refund of ${i18n.amount(
                                    value,
                                    amount.currency
                                )} is being processed. You can only send a refund for the remaining amount.`,
                            });
                            return;
                        default:
                            return;
                    }
                });
        }

        return statusAlerts;
    }, [details?.refundStatuses, transaction, refundableAmount, i18n, refundCurrency, refundedAmount]);

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
        refundStatuses, //the refund statuses
        refundLocked, // whether refund action for the payment is temporarily locked
        refundMode, // the refund mode of the payment
    } as const;
};

export default useTransactionRefundMetadata;
