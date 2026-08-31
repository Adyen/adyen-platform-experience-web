<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '@integration-components/disputes/domain';
import DisputeDetailsContainer from '../../DisputeManagement/components/DisputeDetailsContainer.vue';
import { useDisputesContext } from '../../integration/context';
import type { DisputeManagementEmits, DisputeManagementEventMap } from '../../events';

const props = defineProps<{
    disputeId?: string;
    dataCustomization?: DisputeDetailsCustomization;
    showContactSupport: boolean;
    refreshDisputesList: (statusGroup?: IDisputeStatusGroup) => void;
    onClose: () => void;
}>();
const emit = defineEmits<DisputeManagementEmits>();

const { i18n } = useDisputesContext();

const disputeManagementSuccessful = ref(false);
const isOpen = computed(() => !!props.disputeId);

watch(
    () => props.disputeId,
    id => {
        if (id) disputeManagementSuccessful.value = false;
    }
);

function onDisputeManagementSuccessful() {
    disputeManagementSuccessful.value = true;
}

function onDisputeAccepted(payload: DisputeManagementEventMap['disputeAccepted']) {
    onDisputeManagementSuccessful();
    emit('disputeAccepted', payload);
}

function onDisputeDefended(payload: DisputeManagementEventMap['disputeDefended']) {
    onDisputeManagementSuccessful();
    emit('disputeDefended', payload);
}

function onContactSupportRequested(payload: DisputeManagementEventMap['contactSupportRequested']) {
    emit('contactSupportRequested', payload);
}

function onDismissed(payload: DisputeManagementEventMap['dismissed']) {
    emit('dismissed', payload);
    onCloseModal();
}

function onCloseModal() {
    if (disputeManagementSuccessful.value) {
        disputeManagementSuccessful.value = false;
        props.refreshDisputesList('CHARGEBACKS');
    }
    props.onClose();
}
</script>

<template>
    <BentoModal
        size="small"
        :is-open="isOpen"
        :is-dismissible="true"
        :aria-label="i18n.get('disputes.management.common.title')"
        @close-modal="onCloseModal"
    >
        <!-- Keep this default slot empty, needed for no padding. -->
        <template #default />
        <template #content>
            <DisputeDetailsContainer
                v-if="props.disputeId"
                :id="props.disputeId"
                :data-customization="props.dataCustomization ? { details: props.dataCustomization } : undefined"
                :show-contact-support="props.showContactSupport"
                render-mode="modal"
                @contact-support-requested="onContactSupportRequested"
                @dispute-accepted="onDisputeAccepted"
                @dispute-defended="onDisputeDefended"
                @dismissed="onDismissed"
            />
        </template>
    </BentoModal>
</template>
