<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import CrossCircleFillIcon from '@adyen/ui-assets-icons-40/vue/cross-circle-filled';
import { useCoreContext } from '@integration-components/core/vue';
import { DefendResponse, DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';

const { i18n } = useCoreContext();
const { defendResponse, clearFiles, clearStates, setFlowState } = useDisputeFlow();

const isSuccess = computed(() => defendResponse.value === DefendResponse.Success);

function goBackToDetails() {
    clearStates();
    setFlowState(DisputeFlowState.Details);
}

function goBackToFileUploadView() {
    clearFiles();
    setFlowState(DisputeFlowState.UploadDefenseFiles);
}
</script>

<template>
    <div class="adyen-pe-defend-dispute__response">
        <div v-if="isSuccess" class="adyen-pe-defend-dispute__success">
            <CheckmarkCircleFillIcon class="adyen-pe-defend-dispute__success-icon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.common.evidenceSubmitted') }}
            </BentoTypography>
            <BentoTypography class="adyen-pe-defend-dispute__success-description" variant="body">
                {{ i18n.get('disputes.management.defend.chargeback.submitSuccessInfo') }}
            </BentoTypography>
            <BentoButton variant="secondary" @click="goBackToDetails">
                {{ i18n.get('disputes.management.common.actions.showDetails') }}
            </BentoButton>
        </div>
        <div v-else class="adyen-pe-defend-dispute__error">
            <CrossCircleFillIcon class="adyen-pe-defend-dispute__error-icon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.common.errors.somethingWentWrong') }}
            </BentoTypography>
            <BentoTypography variant="body">
                {{ i18n.get('disputes.management.defend.common.errors.defenseFailed') }}
            </BentoTypography>
            <BentoButton variant="secondary" @click="goBackToFileUploadView">
                {{ i18n.get('disputes.management.common.actions.goBack') }}
            </BentoButton>
        </div>
    </div>
</template>
