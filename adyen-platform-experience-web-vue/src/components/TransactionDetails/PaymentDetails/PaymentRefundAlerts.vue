<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { TX_REFUND_STATUSES_CONTAINER } from '../constants';
import { RefundedState } from '../types';

const props = defineProps<{
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<string, readonly number[] | undefined>>;
    refundCurrency: string;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
}>();

const { i18n } = useCoreContext();

function getFormattedAmountsList(amounts: readonly number[]): string {
    const formatted = amounts.map(amount => i18n.amount(amount, props.refundCurrency));
    // Join with locale-aware conjunction
    try {
        const listFormatter = new (Intl as any).ListFormat(i18n.locale, { type: 'conjunction' });
        return listFormatter.format(formatted);
    } catch {
        return formatted.join(', ');
    }
}

interface AlertItem {
    description: string;
    type?: 'warning' | 'tip';
}

const alerts = computed<AlertItem[]>(() => {
    const result: AlertItem[] = [];

    if (props.refundedState === RefundedState.FULL) {
        result.push({ description: i18n.get('transactions.details.refund.alerts.refundedFull') });
    } else {
        if (props.refundedAmount > 0) {
            const values = { amount: getFormattedAmountsList([props.refundedAmount]) };
            result.push({ description: i18n.get('transactions.details.refund.alerts.refundedAmount', { values: values.amount }) });
        }

        if (props.refundLocked) {
            result.push({ description: i18n.get('transactions.details.refund.alerts.inProgressBlocked') });
        } else {
            const inProgress = props.refundAmounts.in_progress;
            if (inProgress && inProgress.length > 0) {
                if (props.fullRefundInProgress) {
                    result.push({ description: i18n.get('transactions.details.refund.alerts.inProgress') });
                } else {
                    const values = { amount: getFormattedAmountsList(inProgress) };
                    result.push({ description: i18n.get('transactions.details.refund.alerts.inProgressAmount', { amount: values.amount }) });
                }
            }

            const failed = props.refundAmounts.failed;
            if (failed && failed.length > 0) {
                if (props.fullRefundFailed) {
                    result.push({ type: 'warning', description: i18n.get('transactions.details.refund.alerts.notPossible') });
                } else {
                    const values = { amount: getFormattedAmountsList(failed) };
                    result.push({
                        type: 'warning',
                        description: i18n.get('transactions.details.refund.alerts.notPossibleAmount', { amount: values.amount }),
                    });
                }
            }
        }
    }

    return result;
});
</script>

<template>
    <div v-if="alerts.length > 0" :class="TX_REFUND_STATUSES_CONTAINER">
        <bento-alert v-for="(alert, index) in alerts" :key="index" :variant="alert.type === 'warning' ? 'default' : 'tip'" inline>
            <template #description>
                <bento-typography variant="body">
                    {{ alert.description }}
                </bento-typography>
            </template>
        </bento-alert>
    </div>
</template>
