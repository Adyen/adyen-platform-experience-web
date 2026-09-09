<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type { DisputeDetailsCustomization } from '@integration-components/disputes/domain';

const props = defineProps<{
    disputeId?: string;
    dataCustomization?: DisputeDetailsCustomization;
    onContactSupport?: () => void;
    refreshDisputesList: (statusGroup?: IDisputeStatusGroup) => void;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();

const DisputeDetailsContainer = defineAsyncComponent({
    loader: () => import('../../DisputeManagement/components/DisputeDetailsContainer.vue'),
    loadingComponent: BentoLoadingIndicator,
    delay: 0,
});
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
    <ModalContextProvider>
        <BentoModal
            size="small"
            :is-open="isOpen"
            :is-dismissible="true"
            :aria-label="i18n.get('disputes.management.common.title')"
            @close-modal="onCloseModal"
        >
            <!-- Keep this default slot empty — needed for no padding -->
            <template #default />
            <template #content>
                <DisputeDetailsContainer
                    v-if="props.disputeId"
                    :id="props.disputeId"
                    :data-customization="props.dataCustomization ? { details: props.dataCustomization } : undefined"
                    :on-contact-support="props.onContactSupport"
                    :on-dispute-accept="onDisputeManagementSuccessful"
                    :on-dispute-defend="onDisputeManagementSuccessful"
                    :on-dismiss="onCloseModal"
                />
            </template>
        </BentoModal>
    </ModalContextProvider>
</template>
