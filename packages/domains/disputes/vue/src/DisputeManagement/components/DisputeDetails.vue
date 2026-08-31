<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useDisputesContext } from '../../integration/context';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import AcceptDisputeFlow from './AcceptDisputeFlow.vue';
import DefendDisputeFlow from './DefendDisputeFlow.vue';
import DisputeData from './DisputeData.vue';
import type { DisputeManagementProps } from '../types';
import styles from './DisputeData.module.scss';
import type { DisputeManagementRenderMode } from '../../integration/types';

const props = defineProps<
    Pick<DisputeManagementProps, 'dataCustomization' | 'hideTitle' | 'id'> & {
        canContactSupport: boolean;
        canDismiss: boolean;
        renderMode: DisputeManagementRenderMode;
    }
>();
const { i18n, runtime } = useDisputesContext();
const { flowState, getDisputesConfig } = useDisputeFlow();

const shouldHideTitle = computed(() => props.hideTitle || props.renderMode === 'modal');

// The dispute flow is only reachable when the component is authorized; do not fetch
// defense configuration while availability is pending or the role is not assigned.
let disputesConfigRequested = false;
watch(
    () => runtime.available,
    available => {
        if (available === true && !disputesConfigRequested) {
            disputesConfigRequested = true;
            void getDisputesConfig();
        }
    },
    { immediate: true }
);
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
        :can-contact-support="props.canContactSupport"
        :can-dismiss="props.canDismiss"
    />
    <AcceptDisputeFlow v-else-if="flowState === DisputeFlowState.Accept" />
    <DefendDisputeFlow v-else />
</template>
