import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { boolOrFalse, isFunction } from '@integration-components/utils';
import { RefundMode, RefundedState, REFUND_STATUSES } from '../../../../domain/src';
import type { TransactionDetails } from '../../../../domain/src';
import type { IRefundMode } from '@integration-components/types';

export function useRefundMetadata(transaction: () => TransactionDetails | undefined) {
    const config = useConfigContext();

    const details = computed(() => transaction()?.refundDetails);
    const refundMode = computed<IRefundMode>(() => details.value?.refundMode ?? RefundMode.FULL_AMOUNT);
    const refundLocked = computed(() => boolOrFalse(details.value?.refundLocked));
    const refundable = computed(() => refundMode.value !== RefundMode.NON_REFUNDABLE);

    const refundableAmount = computed(() => (transaction() ? Math.max(0, details.value?.refundableAmount?.value ?? 0) : 0));

    const refundAuthorization = computed(() => isFunction(config.endpoints.initiateRefund));
    const refundAvailable = computed(() => refundAuthorization.value && refundable.value && refundableAmount.value > 0);
    const refundCurrency = computed(() => details.value?.refundableAmount?.currency ?? transaction()?.netAmount.currency ?? '');
    const refundDisabled = computed(() => !refundAvailable.value || refundLocked.value);

    const refundAmounts = computed(() => {
        let latestNonFailedRefundIndex = -1;
        return (details.value?.refundStatuses ?? []).reduceRight(
            (acc, { amount, status }, index) => {
                if (amount.value !== 0 && REFUND_STATUSES.includes(status)) {
                    const isNonFailed = status !== 'failed';
                    const isMoreRecent = index > latestNonFailedRefundIndex;
                    if (isNonFailed && isMoreRecent) latestNonFailedRefundIndex = index;
                    if (isNonFailed || isMoreRecent) {
                        const updated = (acc[status] ?? []).concat(Math.abs(amount.value));
                        return { ...acc, [status]: updated };
                    }
                }
                return acc;
            },
            {} as Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>
        );
    });

    const refundedAmount = computed(() => (refundAmounts.value.completed ?? []).reduce((sum, a) => sum + a, 0));

    const fullRefundFailed = computed(() => {
        if (refundedAmount.value !== 0) return false;
        const refunding = refundAmounts.value.in_progress ?? [];
        const failed = refundAmounts.value.failed ?? [];
        return refunding.length === 0 && failed.slice(-1)[0] === refundableAmount.value;
    });

    const fullRefundInProgress = computed(() => {
        if (refundedAmount.value !== 0) return false;
        const refunding = refundAmounts.value.in_progress ?? [];
        return refunding.length === 1 && refunding[0] === refundableAmount.value;
    });

    const refundedState = computed(() => {
        if (refundedAmount.value > 0) {
            switch (refundMode.value) {
                case RefundMode.NON_REFUNDABLE:
                    if (refundableAmount.value === 0) return RefundedState.FULL;
                    break;
                case RefundMode.PARTIAL_AMOUNT:
                case RefundMode.PARTIAL_LINE_ITEMS:
                    if (refundableAmount.value > 0) return RefundedState.PARTIAL;
                    break;
            }
        }
        return RefundedState.INDETERMINATE;
    });

    return {
        fullRefundFailed,
        fullRefundInProgress,
        refundableAmount,
        refundable,
        refundAvailable,
        refundAuthorization,
        refundCurrency,
        refundDisabled,
        refundAmounts,
        refundedAmount,
        refundedState,
        refundLocked,
        refundMode,
    } as const;
}
