<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, BentoCheckbox, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import { DISPUTE_TYPE } from '@integration-components/disputes/domain';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import flowStyles from './DisputeFlow.module.scss';
import styles from './AcceptDisputeFlow.module.scss';
import { useDisputesContext } from '../../integration/context';
import { disputeManagementEventBridge } from '../../events';

const { i18n, runtime } = useDisputesContext();
const events = disputeManagementEventBridge.useEvents();
const { dispute, clearStates, goBack } = useDisputeFlow();
const cachedDispute = ref(dispute.value);

watch(
    dispute,
    nextDispute => {
        if (nextDispute) cachedDispute.value = nextDispute;
    },
    { immediate: true }
);

const disputePspReference = computed(() => cachedDispute.value?.dispute.pspReference);
const isRequestForInformation = computed(() => cachedDispute.value?.dispute.type === DISPUTE_TYPE.REQUEST_FOR_INFORMATION);

const termsAgreed = ref(false);
const disputeAccepted = ref(false);
const isLoading = ref(false);
const callbackCalled = ref(false);

const acceptedLabel = computed(() =>
    isRequestForInformation.value
        ? i18n.get('disputes.management.accept.requestForInformation.accepted')
        : i18n.get('disputes.management.accept.chargeback.accepted')
);
const acceptDisclaimer = computed(() =>
    isRequestForInformation.value
        ? i18n.get('disputes.management.accept.requestForInformation.disclaimer')
        : i18n.get('disputes.management.accept.chargeback.disclaimer')
);
const acceptTitle = computed(() =>
    isRequestForInformation.value
        ? i18n.get('disputes.management.accept.requestForInformation.title')
        : i18n.get('disputes.management.accept.chargeback.title')
);
const acceptButtonTitle = computed(() =>
    isRequestForInformation.value
        ? i18n.get('disputes.management.accept.requestForInformation.actions.accept')
        : i18n.get('disputes.management.accept.chargeback.actions.accept')
);
const interactionsDisabled = computed(() => isLoading.value || disputeAccepted.value);
const canAcceptDispute = computed(() => termsAgreed.value && !interactionsDisabled.value && runtime.canAccept && !!disputePspReference.value);
const actionButtons = computed(() => [
    {
        title: acceptButtonTitle.value,
        disabled: !canAcceptDispute.value,
        event: acceptDisputeCallback,
        state: isLoading.value ? 'loading' : 'start',
    },
    {
        title: i18n.get('disputes.management.common.actions.goBack'),
        disabled: isLoading.value,
        event: goBack,
        variant: 'secondary',
    },
]);

const acceptError = ref(false);
let acceptController: AbortController | undefined;

async function acceptDisputeCallback() {
    const pspReference = disputePspReference.value;
    if (!canAcceptDispute.value || !pspReference) return;

    acceptController?.abort();
    acceptController = new AbortController();
    isLoading.value = true;
    acceptError.value = false;
    try {
        await runtime.acceptDispute({ disputePspReference: pspReference, signal: acceptController.signal });
        clearStates();
        disputeAccepted.value = true;
    } catch {
        if (!acceptController.signal.aborted) acceptError.value = true;
    } finally {
        if (!acceptController.signal.aborted) isLoading.value = false;
    }
}

watch(disputeAccepted, accepted => {
    const pspReference = disputePspReference.value;
    if (!accepted || callbackCalled.value || !pspReference) return;
    callbackCalled.value = true;
    events.disputeAccepted({ id: pspReference });
});

onUnmounted(() => acceptController?.abort());
</script>

<template>
    <div :class="flowStyles.container">
        <div v-if="disputeAccepted" :class="flowStyles.success">
            <SuccessIcon :class="flowStyles.successIcon" data-testid="accept-dispute-success-icon" aria-hidden="true" />
            <BentoTypography variant="title">
                {{ acceptedLabel }}
            </BentoTypography>
            <BentoButton variant="secondary" @click="goBack">
                {{ i18n.get('disputes.management.common.actions.showDetails') }}
            </BentoButton>
        </div>
        <template v-else>
            <BentoTypography el="h2" variant="title">
                {{ acceptTitle }}
            </BentoTypography>
            <BentoTypography variant="body">
                {{ acceptDisclaimer }}
            </BentoTypography>
            <div :class="styles.input">
                <BentoCheckbox v-model="termsAgreed" :disabled="interactionsDisabled" required>
                    {{ i18n.get('disputes.management.accept.common.agree') }}
                </BentoCheckbox>
            </div>
            <BentoAlert v-if="acceptError" type="critical" role="alert">
                <template #description>
                    {{ i18n.get('disputes.management.common.errors.unavailable') }}
                </template>
            </BentoAlert>
            <div :class="flowStyles.actions">
                <BentoButtonActions :actions="actionButtons as BentoButtonActionsList" />
            </div>
        </template>
    </div>
</template>
