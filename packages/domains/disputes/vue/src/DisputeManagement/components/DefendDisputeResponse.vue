<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkIcon from '@adyen/ui-assets-icons-24/vue/checkmark-circle';
import CrossIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
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
        title: isSuccess.value ? i18n.get('disputes.management.actions.showDetails') : i18n.get('disputes.common.goBack.label'),
        event: isSuccess.value ? goBackToDetails : goBackToFileUploadView,
        variant: 'secondary',
    },
]);
</script>

<template>
    <div :class="flowStyles.response">
        <div v-if="isSuccess" :class="flowStyles.success">
            <CheckmarkIcon :class="flowStyles.successIcon" />
            <BentoTypography variant="title">
                {{ i18n.get('disputes.management.defend.evidenceSubmitted') }}
            </BentoTypography>
            <BentoTypography :class="flowStyles.successDescription" variant="body">
                {{ i18n.get('disputes.management.defend.chargeback.submitSuccessInfo') }}
            </BentoTypography>
            <ResponsiveButtonActions :actions="actionButtons" />
        </div>
        <div v-else :class="flowStyles.error">
            <CrossIcon :class="flowStyles.errorIcon" />
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
