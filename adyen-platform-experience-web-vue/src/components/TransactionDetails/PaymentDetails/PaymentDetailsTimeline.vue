<script setup lang="ts">
import { computed } from 'vue';
import { BentoTimeline, BentoTimelineItem, BentoStructuredList, BentoStructuredListItem, BentoTypography, BentoDateFormat } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { TX_TIMELINE_LABEL, TX_TIMELINE_VALUE } from '../constants';
import type { TransactionDetails, TransactionEvent } from '../types';

const props = defineProps<{
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();

const events = computed(() => props.transaction.events ?? []);

function makeTimestamp(createdAt: string): { date: Date; format: BentoDateFormat } {
    const date = new Date(createdAt);
    return { date, format: 'LLL dd, yyyy, H:mm' as BentoDateFormat };
}

function getEventType(event: TransactionEvent): string {
    const typeKey = `transactions.details.timeline.types.${event.type}`;
    const formattedType = i18n.has(typeKey) ? i18n.get(typeKey) : event.type;

    // Hardcoded type mapping matching the Preact implementation
    if (event.status.toLowerCase().includes('refund')) return 'Refund';
    if (event.status.toLowerCase().includes('auth')) return 'Capture';
    return formattedType;
}

function getEventStatus(event: TransactionEvent): string {
    const statusKey = `transactions.details.timeline.statuses.${event.status}`;
    return i18n.has(statusKey) ? i18n.get(statusKey) : event.status;
}

function formatEventAmount(event: TransactionEvent): string {
    const { value, currency } = event.amount;
    return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
}
</script>

<template>
    <template v-if="events.length > 0">
        <bento-timeline>
            <bento-timeline-item
                v-for="(event, index) in events"
                :key="index"
                :title="getEventType(event)"
                :timestamp="makeTimestamp(event.createdAt)"
            >
                <bento-structured-list>
                    <bento-structured-list-item :label="i18n.get('transactions.details.timeline.fields.amount')">
                        <template #label>
                            <bento-typography variant="caption" :class="TX_TIMELINE_LABEL">
                                {{ i18n.get('transactions.details.timeline.fields.amount') }}
                            </bento-typography>
                        </template>
                        <bento-typography variant="caption" :class="TX_TIMELINE_VALUE">
                            {{ formatEventAmount(event) }}
                        </bento-typography>
                    </bento-structured-list-item>
                    <bento-structured-list-item :label="i18n.get('transactions.details.timeline.fields.status')">
                        <template #label>
                            <bento-typography variant="caption" :class="TX_TIMELINE_LABEL">
                                {{ i18n.get('transactions.details.timeline.fields.status') }}
                            </bento-typography>
                        </template>
                        <bento-typography variant="caption" :class="TX_TIMELINE_VALUE">
                            {{ getEventStatus(event) }}
                        </bento-typography>
                    </bento-structured-list-item>
                </bento-structured-list>
            </bento-timeline-item>
        </bento-timeline>
    </template>
</template>
