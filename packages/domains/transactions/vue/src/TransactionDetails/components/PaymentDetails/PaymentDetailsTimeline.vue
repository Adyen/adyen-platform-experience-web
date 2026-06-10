<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTimeline, BentoTimelineItem } from '@adyen/bento-vue3';
import { getTransactionTimelineTxStatus, getTransactionTimelineTxType } from '@integration-components/transactions/domain';
import type { TransactionDetails } from '@integration-components/transactions/domain';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const events = computed(() => props.transaction.events ?? []);

function formatAmount(value: number, currency: string): string {
    return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
}

function getFixedType(status: string, formattedType: string): string {
    if (status.toLowerCase().includes('refund')) return 'Refund';
    if (status.toLowerCase().includes('auth')) return 'Capture';
    return formattedType;
}
</script>

<template>
    <BentoTimeline v-if="events.length">
        <BentoTimelineItem
            v-for="(event, index) in events"
            :key="`${event.createdAt}-${event.status}-${index}`"
            :title="getFixedType(event.status, getTransactionTimelineTxType(i18n, event.type) as string)"
            :timestamp="{ date: new Date(event.createdAt) }"
            :data-list="[
                {
                    label: i18n.get('transactions.details.timeline.fields.amount'),
                    value: formatAmount(event.amount.value, event.amount.currency),
                },
                {
                    label: i18n.get('transactions.details.timeline.fields.status'),
                    value: getTransactionTimelineTxStatus(i18n, event.status) as string,
                },
            ]"
        />
    </BentoTimeline>
</template>
