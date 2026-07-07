<script setup lang="ts">
import { onMounted } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import AcceptDisputeFlow from './AcceptDisputeFlow.vue';
import DefendDisputeFlow from './DefendDisputeFlow.vue';
import DisputeData from './DisputeData.vue';
import type { DisputeManagementProps } from '../types';

const props = defineProps<DisputeManagementProps>();
const { i18n } = useCoreContext();
const { flowState, getDisputesConfig } = useDisputeFlow();

onMounted(() => {
    void getDisputesConfig();
});
</script>

<template>
    <div :class="{ 'adyen-pe-visually-hidden': flowState !== DisputeFlowState.Details }">
        <BentoTypography v-if="!props.hideTitle" el="h1" variant="title" stronger>
            {{ i18n.get('disputes.management.common.title') }}
        </BentoTypography>
    </div>

    <DisputeData
        v-if="flowState === DisputeFlowState.Details"
        :dispute-id="props.id"
        :data-customization="props.dataCustomization"
        :on-contact-support="props.onContactSupport"
        :on-dismiss="props.onDismiss"
    />
    <AcceptDisputeFlow v-else-if="flowState === DisputeFlowState.Accept" :on-dispute-accept="props.onDisputeAccept" />
    <DefendDisputeFlow v-else :on-dispute-defend="props.onDisputeDefend" />
</template>
