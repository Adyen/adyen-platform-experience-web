import { computed } from 'vue';
import { RefundMode, RefundedState, type TransactionDetails } from '../types';
import { REFUND_STATUSES } from '../constants';
import { useConfigContext } from '../../../core/ConfigContext';

export function useRefundMetadata(transactionRef: () => TransactionDetails | undefined) {
    const { endpoints } = useConfigContext();

    const details = computed(() => transactionRef()?.refundDetails);
    const refundMode = computed(() => (details.value?.refundMode as string) ?? RefundMode.FULL_AMOUNT);
    const refundLocked = computed(() => !!details.value?.refundLocked);
    const refundable = computed(() => refundMode.value !== RefundMode.NON_REFUNDABLE);

    const refundableAmount = computed(() => {
        const tx = transactionRef();
        return tx ? Math.max(0, details.value?.refundableAmount?.value ?? 0) : 0;
    });

    const refundAuthorization = computed(() => typeof endpoints.initiateRefund === 'function');
    const refundAvailable = computed(() => refundAuthorization.value && refundable.value && refundableAmount.value > 0);
    const refundCurrency = computed(() => details.value?.refundableAmount?.currency ?? transactionRef()?.netAmount.currency ?? '');
    const refundDisabled = computed(() => !refundAvailable.value || refundLocked.value);

    const refundAmounts = computed(() => {
        let latestNonFailedRefundIndex = -1;

        return (details.value?.refundStatuses ?? []).reduceRight(
            (amounts: Record<string, number[]>, { amount, status }, index) => {
                if (amount.value !== 0 && (REFUND_STATUSES as readonly string[]).includes(status)) {
                    const isNonFailedRefund = status !== 'failed';
                    const isMoreRecentRefund = index > latestNonFailedRefundIndex;

                    if (isNonFailedRefund && isMoreRecentRefund) {
                        latestNonFailedRefundIndex = index;
                    }

                    if (isNonFailedRefund || isMoreRecentRefund) {
                        const updatedStatusAmounts = (amounts[status] ?? []).concat(Math.abs(amount.value));
                        return { ...amounts, [status]: updatedStatusAmounts };
                    }
                }
                return amounts;
            },
            {} as Record<string, number[]>
        );
    });

    const fullRefundFailed = computed(() => {
        const completed = refundAmounts.value.completed ?? [];
        const inProgress = refundAmounts.value.in_progress ?? [];
        const failed = refundAmounts.value.failed ?? [];
        const refundedAmt = completed.reduce((sum, a) => sum + a, 0);

        if (refundedAmt === 0) {
            return inProgress.length === 0 && failed.slice(-1)[0] === refundableAmount.value;
        }
        return false;
    });

    const fullRefundInProgress = computed(() => {
        const completed = refundAmounts.value.completed ?? [];
        const inProgress = refundAmounts.value.in_progress ?? [];
        const refundedAmt = completed.reduce((sum, a) => sum + a, 0);

        if (refundedAmt === 0) {
            return inProgress.length === 1 && inProgress[0] === refundableAmount.value;
        }
        return false;
    });

    const refundedAmount = computed(() => {
        const completed = refundAmounts.value.completed ?? [];
        return completed.reduce((sum, a) => sum + a, 0);
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
    };
}

export default useRefundMetadata;
