<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import AcceptDisputeFlow from './AcceptDisputeFlow.vue';
import DefendDisputeFlow from './DefendDisputeFlow.vue';
import DisputeData from './DisputeData.vue';
import type { DisputeManagementProps } from '../types';
import styles from './DisputeData.module.scss';

const props = defineProps<DisputeManagementProps>();
const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();
const { flowState, getDisputesConfig } = useDisputeFlow();

const { withinModal } = useModalContext();
const shouldHideTitle = computed(() => props.hideTitle || withinModal || hideTitles);

onMounted(() => getDisputesConfig());
</script>

<template>
    <div v-if="!shouldHideTitle && flowState === DisputeFlowState.Details" :class="styles.title">
        <BentoTypography el="h1" variant="title" stronger>
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
