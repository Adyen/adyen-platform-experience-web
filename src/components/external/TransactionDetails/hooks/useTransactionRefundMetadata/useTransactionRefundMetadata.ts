import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../../core/Auth';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { boolOrFalse, isFunction, isUndefined } from '../../../../../utils';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import { RefundMode, RefundedState, RefundStatus } from '../../context/types';
import { checkRefundStatusCollection } from './helpers';
import type { IRefundMode } from '../../../../../types';
import type { TransactionDataProps } from '../../types';

const allStatuses = ['completed', 'in_progress', 'failed'];

export const useTransactionRefundMetadata = (transaction: TransactionDataProps['transaction']) => {
    const { i18n } = useCoreContext();

    const details = transaction?.refundDetails;
    const refundMode: IRefundMode = details?.refundMode ?? RefundMode.FULL_AMOUNT;
    const refundLocked = boolOrFalse(details?.refundLocked);
    const refundable = refundMode !== RefundMode.NON_REFUNDABLE;
    const originalAmount = transaction?.originalAmount?.value;

    const refundableAmount = useMemo(() => (transaction ? Math.max(0, details?.refundableAmount?.value ?? 0) : 0), [details, transaction]);

    const refundAuthorization = isFunction(useAuthContext().endpoints.initiateRefund);
    const refundAvailable = refundAuthorization && refundable && refundableAmount > 0;
    const refundCurrency = details?.refundableAmount?.currency ?? transaction?.amount.currency ?? '';
    const refundDisabled = !refundAvailable || refundLocked;

    const statuses: Record<'in_progress' | 'completed' | 'failed', { amounts: number[]; currency: string }> = useMemo(() => {
        const statusDetails = transaction?.refundDetails?.refundStatuses ?? [];
        return (
            statusDetails
                ?.filter(currentStatus => currentStatus.amount.value !== 0)
                .sort((firstStatus, secondStatus) => {
                    if (allStatuses.includes(firstStatus.status) && allStatuses.includes(secondStatus.status)) {
                        return allStatuses.indexOf(firstStatus.status) > allStatuses.indexOf(secondStatus.status) ? 0 : -1;
                    }
                    return -1;
                })
                .reduce((res, currentStatusValue) => {
                    const currentStatus = currentStatusValue.status;
                    const amount = ~currentStatusValue.amount.value + 1;
                    if (res?.[currentStatus]) {
                        res?.[currentStatus]?.amounts.push(amount);
                        return res;
                    } else {
                        return { ...res, [currentStatus]: { amounts: [amount], currency: currentStatusValue.amount.currency } };
                    }
                }, {} as Record<'in_progress' | 'completed' | 'failed', { amounts: number[]; currency: string }>) ?? {}
        );
    }, [transaction?.refundDetails?.refundStatuses]);

    const refundedAmount = useMemo(() => {
        const totalCompleted = statuses.completed?.amounts?.reduce((sum, amount) => sum + amount, 0);
        return totalCompleted ? Math.max(0, totalCompleted ?? 0) : 0;
    }, [statuses]);

    const { some: someRefunded, every: allRefunded } = useMemo(
        () => checkRefundStatusCollection(({ status }) => status === RefundStatus.COMPLETED, details?.refundStatuses),
        [details?.refundStatuses]
    );

    const refundStatuses = useMemo(() => {
        if (refundableAmount === 0 && refundedAmount > 0 && allRefunded && refundedAmount === originalAmount) {
            return [{ type: AlertTypeOption.HIGHLIGHT, label: i18n.get('refund.fullAmountRefunded') }];
        } else {
            const statusAlerts = Object.keys(statuses)?.map(status => {
                const currentStatus = status as 'in_progress' | 'completed' | 'failed';
                const formattedAmount = statuses?.[currentStatus]?.amounts.reduce((res, value, currentIndex) => {
                    const amountsLength = statuses?.[currentStatus]?.amounts.length;
                    if (amountsLength > 1 && currentIndex === amountsLength - 1)
                        return `${res ? `${res}` : ''} ${i18n.get('and')} ${i18n.amount(value, statuses?.[currentStatus]?.currency)}`;
                    return `${res ? `${res},` : ''} ${i18n.amount(value, statuses?.[currentStatus]?.currency)}`;
                }, '');
                const totalAmount = statuses?.[currentStatus]?.amounts.reduce((sum, amount) => sum + amount, 0);

                switch (status) {
                    case RefundStatus.COMPLETED:
                        return {
                            type: AlertTypeOption.HIGHLIGHT,
                            label: i18n.get('refund.amountAlreadyRefunded', { values: { amount: formattedAmount } }),
                        };
                    case RefundStatus.IN_PROGRESS:
                        if (totalAmount === originalAmount) {
                            return {
                                type: AlertTypeOption.HIGHLIGHT,
                                label: i18n.get('refund.theRefundIsBeingProcessed'),
                            };
                        } else {
                            return {
                                type: AlertTypeOption.HIGHLIGHT,
                                label: i18n.get('refund.amountInProgress', { values: { amount: formattedAmount } }),
                            };
                        }
                    case RefundStatus.FAILED:
                        if (totalAmount === originalAmount) {
                            return {
                                type: AlertTypeOption.WARNING,
                                label: i18n.get('refund.fullAmountFailed'),
                            };
                        } else {
                            return {
                                type: AlertTypeOption.WARNING,
                                label: i18n.get('refund.amountFailed', { values: { amount: formattedAmount } }),
                            };
                        }
                    default:
                        return;
                }
            });
            return statusAlerts ?? [];
        }
    }, [refundableAmount, originalAmount, i18n, refundedAmount, statuses, allRefunded]);

    const refundableAmountLabel = useMemo(() => {
        if (refundableAmount > 0) {
            const formattedAmount = i18n.amount(refundableAmount, refundCurrency);
            switch (refundMode) {
                case RefundMode.FULL_AMOUNT:
                    return {
                        type: AlertTypeOption.HIGHLIGHT,
                        description: i18n.get('refund.onlyRefundable', { values: { amount: formattedAmount } }),
                    };
                case RefundMode.PARTIAL_AMOUNT:
                    return {
                        type: AlertTypeOption.HIGHLIGHT,
                        description: i18n.get('refund.maximumRefundable', { values: { amount: formattedAmount } }),
                    };
                default:
                    return null;
            }
        }
        return null;
    }, [i18n, refundableAmount, refundCurrency, refundMode]);

    const refundedState = useMemo(() => {
        switch (refundMode) {
            case RefundMode.NON_REFUNDABLE:
                if (refundableAmount === 0 && refundedAmount > 0 && allRefunded && refundedAmount === originalAmount) {
                    return RefundedState.FULL;
                }
        }

        switch (refundMode) {
            case RefundMode.PARTIAL_AMOUNT:
            case RefundMode.PARTIAL_LINE_ITEMS:
                if (refundableAmount > 0 && someRefunded && refundedAmount > 0 && !isUndefined(originalAmount) && refundedAmount < originalAmount) {
                    return RefundedState.PARTIAL;
                }
        }

        return RefundedState.INDETERMINATE;
    }, [refundableAmount, refundedAmount, refundMode, originalAmount, someRefunded, allRefunded]);

    return {
        refundableAmount, // the maximum amount still available for refund
        refundable, // whether the refund mode of the payment allows for refund
        refundableAmountLabel,
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
