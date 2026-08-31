<script setup lang="ts">
import { computed } from 'vue';
import { BentoDateFormat, BentoTimeline, BentoTimelineItem } from '@adyen/bento-vue3';
import { getActivityDescriptionKey, getActivityStatus, getActivityTitleKey } from '../../../../../domain/src';
import type { IPaymentLinkActivity } from '@integration-components/types';
import { usePayByLinkContext } from '../../../integration/context';

const props = defineProps<{
    activities: IPaymentLinkActivity[];
}>();

const { i18n } = usePayByLinkContext();

const timelineItems = computed(() =>
    props.activities.map(activity => {
        const titleKey = getActivityTitleKey(activity);
        const descriptionKey = getActivityDescriptionKey(activity);
        return {
            title: titleKey ? i18n.get(titleKey) : undefined,
            description: descriptionKey ? i18n.get(descriptionKey) : undefined,
            date: new Date(activity.date),
            status: getActivityStatus(activity),
        } as const;
    })
);
</script>

<template>
    <BentoTimeline>
        <BentoTimelineItem
            v-for="(item, index) in timelineItems"
            :key="`${item.date.getTime()}_${index}`"
            :title="item.title"
            :description="item.description"
            :status="item.status"
            :timestamp="{
                date: item.date,
                format: BentoDateFormat.FULL_DATE_EXACT_TIME_WITHOUT_PERIOD,
            }"
        />
    </BentoTimeline>
</template>
