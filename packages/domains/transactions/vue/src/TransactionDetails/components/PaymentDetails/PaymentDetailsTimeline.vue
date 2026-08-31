<script setup lang="ts">
import { computed } from 'vue';
import { BentoDateFormat, BentoTimeline, BentoTimelineItem, BentoTimelineShowMorePlacement } from '@adyen/bento-vue3';
import { getTransactionTimelineTxStatus, getTransactionTimelineTxType } from '../../../../../domain/src';
import { DATE_FORMAT_TRANSACTIONS } from '@integration-components/utils/datetime/formats';
import type { TransactionDetails } from '../../../../../domain/src';
import { useTransactionsContext } from '../../../integration/context';
import { formatDate } from '../../../integration/format';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useTransactionsContext();

const events = computed(() => props.transaction.events ?? []);

function formatAmount(value: number, currency: string): string {
    return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
}

function getFixedType(status: string, formattedType: string): string {
    if (status.toLowerCase().includes('refund')) return 'Refund';
    if (status.toLowerCase().includes('auth')) return 'Capture';
    return formattedType;
}

function formatTimestamp(date: string): string {
    return formatDate(i18n, date, DATE_FORMAT_TRANSACTIONS, props.transaction.balanceAccount?.timeZone);
}
</script>

<template>
    <BentoTimeline v-if="events.length" :show-more="{ limit: 2, placement: BentoTimelineShowMorePlacement.BEFORE_LAST }">
        <BentoTimelineItem
            v-for="(event, index) in events"
            :key="`${event.createdAt}-${event.status}-${index}`"
            :title="getFixedType(event.status, getTransactionTimelineTxType(i18n, event.type) as string)"
            :timestamp="{
                date: new Date(event.createdAt),
                format: BentoDateFormat.FULL_DATE_TIME_WITHOUT_PERIOD,
                value: formatTimestamp(event.createdAt),
            }"
            :dataList="[
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
