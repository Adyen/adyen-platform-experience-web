<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { REFUND_STATUSES, RefundedState, TX_REFUND_STATUSES_CONTAINER } from '@integration-components/transactions/domain';

const props = defineProps<{
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>;
    refundCurrency: string;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
}>();

const { i18n } = useCoreContext();

const listFormatter = computed(() => new Intl.ListFormat(i18n.locale, { type: 'conjunction' }));

function formatAmountsList(amounts: readonly number[]): string {
    return listFormatter.value.format(amounts.map(a => i18n.amount(a, props.refundCurrency)));
}

interface AlertItem {
    type: 'highlight' | 'warning';
    description: string;
}

const alerts = computed<AlertItem[]>(() => {
    const list: AlertItem[] = [];

    if (props.refundedState === RefundedState.FULL) {
        list.push({ type: 'highlight', description: i18n.get('transactions.details.refund.alerts.refundedFull') });
    } else {
        if (props.refundedAmount > 0) {
            const values = { amount: formatAmountsList([props.refundedAmount]) };
            list.push({ type: 'highlight', description: i18n.get('transactions.details.refund.alerts.refundedAmount', { values }) });
        }

        if (props.refundLocked) {
            list.push({ type: 'highlight', description: i18n.get('transactions.details.refund.alerts.inProgressBlocked') });
        } else {
            const inProgress = props.refundAmounts.in_progress ?? [];
            if (inProgress.length > 0) {
                if (props.fullRefundInProgress) {
                    list.push({ type: 'highlight', description: i18n.get('transactions.details.refund.alerts.inProgress') });
                } else {
                    const values = { amount: formatAmountsList(inProgress) };
                    list.push({ type: 'highlight', description: i18n.get('transactions.details.refund.alerts.inProgressAmount', { values }) });
                }
            }

            const failed = props.refundAmounts.failed ?? [];
            if (failed.length > 0) {
                if (props.fullRefundFailed) {
                    list.push({ type: 'warning', description: i18n.get('transactions.details.refund.alerts.notPossible') });
                } else {
                    const values = { amount: formatAmountsList(failed) };
                    list.push({ type: 'warning', description: i18n.get('transactions.details.refund.alerts.notPossibleAmount', { values }) });
                }
            }
        }
    }

    return list;
});
</script>

<template>
    <div v-if="alerts.length > 0" :class="TX_REFUND_STATUSES_CONTAINER">
        <BentoAlert v-for="(alert, idx) in alerts" :key="idx" :type="alert.type" variant="tip">
            <template #description>{{ alert.description }}</template>
        </BentoAlert>
    </div>
</template>
