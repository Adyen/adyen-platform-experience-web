<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { DisputeFlowState, provideDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDetails from './DisputeDetails.vue';
import type { DisputeManagementProps } from '../types';
import type { DisputeManagementRenderMode } from '../../integration/types';
import '@adyen/bento-vue3/styles/bento-light';
import styles from './DisputeFlow.module.scss';
import { disputeManagementEventBridge, type DisputeManagementEmits } from '../../events';
import { useDisputesContext } from '../../integration/context';

const props = withDefaults(defineProps<DisputeManagementProps & { renderMode: DisputeManagementRenderMode }>(), {
    showContactSupport: undefined,
});
const emit = defineEmits<DisputeManagementEmits>();
const hasContactSupportListener = disputeManagementEventBridge.hasListener('contactSupportRequested');
const hasDismissListener = disputeManagementEventBridge.hasListener('dismissed');
disputeManagementEventBridge.provideEvents({
    contactSupportRequested: payload => {
        emit('contactSupportRequested', payload);
        props.onContactSupport?.();
    },
    disputeAccepted: payload => {
        emit('disputeAccepted', payload);
        props.onDisputeAccept?.(payload);
    },
    disputeDefended: payload => {
        emit('disputeDefended', payload);
        props.onDisputeDefend?.(payload);
    },
    dismissed: payload => {
        emit('dismissed', payload);
        props.onDismiss?.();
    },
});
if (props.renderMode === 'standalone') useDisputesContext().provideTranslationOverrides();
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
            :can-contact-support="props.showContactSupport ?? (!!props.onContactSupport || hasContactSupportListener.value)"
            :can-dismiss="!!props.onDismiss || hasDismissListener.value"
            :render-mode="props.renderMode"
        />
    </div>
</template>
