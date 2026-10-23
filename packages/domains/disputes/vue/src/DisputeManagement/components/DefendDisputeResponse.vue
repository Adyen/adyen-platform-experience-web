<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import CrossCircleFillIcon from '@adyen/ui-assets-icons-40/vue/cross-circle-filled';
import { useCoreContext } from '@integration-components/core/vue';
import { ResponsiveButtonActions } from '@integration-components/composables-vue';
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

const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: isSuccess.value ? i18n.get('disputes.management.actions.showDetails') : i18n.get('disputes.management.actions.goBack'),
        event: isSuccess.value ? goBackToDetails : goBackToFileUploadView,
        variant: 'secondary',
    },
]);
</script>

<template>
    <div :class="flowStyles.response">
        <div v-if="isSuccess" :class="flowStyles.success">
            <CheckmarkCircleFillIcon :class="flowStyles.successIcon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.evidenceSubmitted') }}
            </BentoTypography>
            <BentoTypography :class="flowStyles.successDescription" variant="body">
                {{ i18n.get('disputes.management.defend.chargeback.submitSuccessInfo') }}
            </BentoTypography>
            <ResponsiveButtonActions :actions="actionButtons" />
        </div>
        <div v-else :class="flowStyles.error">
            <CrossCircleFillIcon :class="flowStyles.errorIcon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.errors.somethingWentWrong') }}
            </BentoTypography>
            <BentoTypography :class="flowStyles.errorDescription" variant="body">
                {{ i18n.get('disputes.management.defend.errors.defenseFailed') }}
            </BentoTypography>
            <ResponsiveButtonActions :actions="actionButtons" />
        </div>
    </div>
</template>
