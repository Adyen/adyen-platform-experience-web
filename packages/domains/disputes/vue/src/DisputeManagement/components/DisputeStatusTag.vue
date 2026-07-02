<script setup lang="ts">
import { computed } from 'vue';
import { BentoTag } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getDisputeStatus, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import type { IDispute } from '@integration-components/types/api/models/disputes';

const props = defineProps<{
    dispute: IDispute;
}>();

const { i18n } = useCoreContext();
const label = computed(() => getDisputeStatus(i18n, props.dispute.status));
const variant = computed(() => {
    if (props.dispute.status === 'WON') return 'green';
    if (props.dispute.defensibility === 'NOT_ACTIONABLE') return 'grey';
    if (isDisputeActionNeededUrgently(props.dispute)) return 'red';
    return 'grey';
});
</script>

<template>
    <BentoTag v-if="label" :label="label" :variant="variant" />
</template>
