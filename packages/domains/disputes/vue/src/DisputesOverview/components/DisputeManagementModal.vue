<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '@integration-components/disputes/domain';
import DisputeDetailsContainer from '../../DisputeManagement/components/DisputeDetailsContainer.vue';

const props = defineProps<{
    disputeId?: string;
    dataCustomization?: DisputeDetailsCustomization;
    onContactSupport?: () => void;
    refreshDisputesList: (statusGroup?: IDisputeStatusGroup) => void;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();

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
        :is-open="isOpen"
        size="small"
        :is-dismissible="true"
        :aria-label="i18n.get('disputes.management.common.title')"
        @close-modal="onCloseModal"
    >
        {{ i18n.get('disputes.management.common.title') }}
        <template #content>
            <DisputeDetailsContainer
                v-if="props.disputeId"
                :id="props.disputeId"
                :data-customization="props.dataCustomization ? { details: props.dataCustomization } : undefined"
                :on-contact-support="props.onContactSupport"
                :on-dispute-accept="onDisputeManagementSuccessful"
                :on-dispute-defend="onDisputeManagementSuccessful"
                :on-dismiss="onCloseModal"
                hide-title
            />
        </template>
    </BentoModal>
</template>
