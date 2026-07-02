<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { DISPUTE_TYPE, type DisputeManagementProps } from '@integration-components/disputes/domain';
import { isFunction } from '@integration-components/utils';
import { DefendResponse, DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import DefendDocumentUpload from './DefendDocumentUpload.vue';
import DefendDisputeResponse from './DefendDisputeResponse.vue';
import DefendReasonSelection from './DefendReasonSelection.vue';

const props = defineProps<{
    onDisputeDefend?: DisputeManagementProps['onDisputeDefend'];
}>();

const { i18n } = useCoreContext();
const { dispute, flowState, defendResponse } = useDisputeFlow();

const cachedDispute = ref(dispute.value);

watch(
    dispute,
    nextDispute => {
        if (nextDispute) cachedDispute.value = nextDispute;
    },
    { immediate: true }
);

const disputePspReference = computed(() => cachedDispute.value?.dispute.pspReference);

const defendDisputeTitle = computed(() =>
    cachedDispute.value?.dispute.type === DISPUTE_TYPE.REQUEST_FOR_INFORMATION
        ? i18n.get('disputes.management.defend.requestForInformation.title')
        : i18n.get('disputes.management.defend.chargeback.title')
);

const showResponseView = computed(() => flowState.value === DisputeFlowState.DefenseSubmitResponse);

const callbackCalled = ref(false);

watch(defendResponse, response => {
    const pspReference = disputePspReference.value;
    if (response !== DefendResponse.Success || callbackCalled.value || !pspReference || !isFunction(props.onDisputeDefend)) return;
    callbackCalled.value = true;
    props.onDisputeDefend({ id: pspReference });
});
</script>

<template>
    <div class="adyen-pe-defend-dispute__container">
        <BentoTypography v-if="!showResponseView" class="adyen-pe-defend-dispute__title" el="h2" variant="title">
            {{ defendDisputeTitle }}
        </BentoTypography>

        <DefendReasonSelection v-if="flowState === DisputeFlowState.DefendReasonSelection" :psp-reference="disputePspReference" />
        <DefendDocumentUpload v-else-if="flowState === DisputeFlowState.UploadDefenseFiles" :psp-reference="disputePspReference" />
        <DefendDisputeResponse v-else />
    </div>
</template>
