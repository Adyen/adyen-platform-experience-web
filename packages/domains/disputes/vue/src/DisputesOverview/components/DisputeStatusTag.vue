<script setup lang="ts">
import { computed } from 'vue';
import { BentoTag } from '@adyen/bento-vue3';
import { useDisputesContext } from '../../integration/context';
import { getDisputeStatus, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import type { IDisputeListItem } from '@integration-components/types/api/models/disputes';

const props = defineProps<{
    dispute: IDisputeListItem;
}>();

const { i18n } = useDisputesContext();
const label = computed(() => getDisputeStatus(i18n, props.dispute.status));
const variant = computed(() => {
    if (props.dispute.status === 'WON') return 'green';
    if (isDisputeActionNeededUrgently(props.dispute)) return 'red';
    return 'grey';
});
</script>

<template>
    <BentoTag v-if="label" :label="label" :variant="variant" />
</template>
