<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import CrossCircleFillIcon from '@adyen/ui-assets-icons-40/vue/cross-circle-filled';
import { useCoreContext } from '@integration-components/core/vue';
import { DefendResponse, DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import flowStyles from './DisputeFlow.module.scss';

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
    <div :class="flowStyles.response">
        <div v-if="isSuccess" :class="flowStyles.success">
            <CheckmarkCircleFillIcon :class="flowStyles.successIcon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.common.evidenceSubmitted') }}
            </BentoTypography>
            <BentoTypography :class="flowStyles.successDescription" variant="body">
                {{ i18n.get('disputes.management.defend.chargeback.submitSuccessInfo') }}
            </BentoTypography>
            <BentoButton variant="secondary" @click="goBackToDetails">
                {{ i18n.get('disputes.management.common.actions.showDetails') }}
            </BentoButton>
        </div>
        <div v-else :class="flowStyles.error">
            <CrossCircleFillIcon :class="flowStyles.errorIcon" />
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
