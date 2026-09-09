<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { DisputeFlowState, provideDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDetails from './DisputeDetails.vue';
import type { DisputeManagementProps } from '../types';
import styles from './DisputeFlow.module.scss';

const props = defineProps<DisputeManagementProps>();
const dispute = ref<IDisputeDetail | undefined>();

const { clearStates, setFlowState } = provideDisputeFlow(dispute);

watch(
    () => props.id,
    () => {
        clearStates();
        setFlowState(DisputeFlowState.Details);
    }
);
</script>

<template>
    <div :class="styles.root">
        <DisputeDetails
            :id="props.id"
            :hide-title="props.hideTitle"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-dispute-accept="props.onDisputeAccept"
            :on-dispute-defend="props.onDisputeDefend"
            :on-dismiss="props.onDismiss"
        />
    </div>
</template>
