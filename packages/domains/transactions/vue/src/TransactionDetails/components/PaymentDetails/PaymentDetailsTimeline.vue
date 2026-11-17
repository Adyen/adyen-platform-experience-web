<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { BentoDateFormat, BentoTimeline, BentoTimelineItem, BentoTimelineShowMorePlacement } from '@adyen/bento-vue3';
import { getTransactionTimelineTxStatus, getTransactionTimelineTxType } from '../../../../../domain/src';
import { DATE_FORMAT_TRANSACTIONS } from '@integration-components/utils/datetime/formats';
import type { TransactionDetails } from '../../../../../domain/src';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const INVALID_DATE = new Date('');
const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting(() => props.transaction.balanceAccount?.timeZone);

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
    return dateFormat(date, DATE_FORMAT_TRANSACTIONS);
}
</script>

<template>
    <BentoTimeline v-if="events.length" :show-more="{ limit: 2, placement: BentoTimelineShowMorePlacement.BEFORE_LAST }">
        <BentoTimelineItem
            v-for="(event, index) in events"
            :key="`${event.createdAt}-${event.status}-${index}`"
            :title="getFixedType(event.status, getTransactionTimelineTxType(i18n, event.type) as string)"
            :timestamp="{
                /**
                 * Bento's timeline item formats `timestamp.date` itself, in the browser timezone (it has no timezone option),
                 * and renders `timestamp.value` next to it. Passing an invalid date makes Bento render an empty date, so the
                 * balance account timezone date passed as `value` is the only date shown. Bento also sorts entries by date;
                 * invalid dates compare as equal, so the events keep their original order.
                 *
                 * The workaround breaks if Bento starts validating `timestamp.date` or if `timegapLimit` is enabled on the timeline.
                 *
                 * [TODO]: Follow up with Bento and drop this workaround once the timeline can show a timezone-aware date, e.g. via:
                 * - a `timeZone` option on `BentoDate` and the timeline `timestamp`
                 * - raw `Intl.DateTimeFormat` options for the timeline `timestamp`
                 * - a timestamp slot, or rendering only `timestamp.value`
                 */
                date: INVALID_DATE,
                format: BentoDateFormat.FULL_DATE_TIME_WITHOUT_PERIOD,
                value: formatTimestamp(event.createdAt),
            }"
            :data-list="[
                {
                    label: i18n.get('transactions.details.timeline.amount'),
                    value: formatAmount(event.amount.value, event.amount.currency),
                },
                {
                    label: i18n.get('transactions.details.timeline.status'),
                    value: getTransactionTimelineTxStatus(i18n, event.status) as string,
                },
            ]"
        />
    </BentoTimeline>
</template>
