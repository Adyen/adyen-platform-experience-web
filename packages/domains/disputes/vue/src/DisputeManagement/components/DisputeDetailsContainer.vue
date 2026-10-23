<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { DisputeFlowState, provideDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDetails from './DisputeDetails.vue';
import type { DisputeManagementComponentProps } from '../types';
import styles from './DisputeFlow.module.scss';

const props = defineProps<DisputeManagementComponentProps>();
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
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-accept="props.onAccept"
            :on-defend="props.onDefend"
            :on-dismiss="props.onDismiss"
        />
    </div>
</template>
