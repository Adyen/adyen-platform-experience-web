<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, BentoCheckbox, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { DISPUTE_TYPE } from '@integration-components/disputes/domain';
import { isFunction } from '@integration-components/utils';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import type { DisputeManagementProps } from '../types';

const props = defineProps<{
    onDisputeAccept?: DisputeManagementProps['onDisputeAccept'];
}>();

const { i18n } = useCoreContext();
const { acceptDispute } = useConfigContext().endpoints || {};
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
const canAcceptDispute = computed(() => termsAgreed.value && !interactionsDisabled.value && isFunction(acceptDispute) && !!disputePspReference.value);
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

async function acceptDisputeCallback() {
    const pspReference = disputePspReference.value;
    if (!canAcceptDispute.value || !isFunction(acceptDispute) || !pspReference) return;

    isLoading.value = true;
    acceptError.value = false;
    try {
        await acceptDispute({}, { path: { disputePspReference: pspReference } });
        clearStates();
        disputeAccepted.value = true;
    } catch {
        acceptError.value = true;
    } finally {
        isLoading.value = false;
    }
}

watch(disputeAccepted, accepted => {
    const pspReference = disputePspReference.value;
    if (!accepted || callbackCalled.value || !pspReference || !isFunction(props.onDisputeAccept)) return;
    callbackCalled.value = true;
    props.onDisputeAccept({ id: pspReference });
});
</script>

<template>
    <div class="adyen-pe-accept-dispute__container">
        <div v-if="disputeAccepted" class="adyen-pe-accept-dispute__success">
            <SuccessIcon class="adyen-pe-accept-dispute__success-icon" data-testid="accept-dispute-success-icon" aria-hidden="true" />
            <BentoTypography variant="title">
                {{ acceptedLabel }}
            </BentoTypography>
            <BentoButton variant="secondary" @click="goBack">
                {{ i18n.get('disputes.management.common.actions.showDetails') }}
            </BentoButton>
        </div>
        <template v-else>
            <BentoTypography class="adyen-pe-accept-dispute__title" el="h2" variant="title">
                {{ acceptTitle }}
            </BentoTypography>
            <BentoTypography variant="body">
                {{ acceptDisclaimer }}
            </BentoTypography>
            <div class="adyen-pe-accept-dispute__input">
                <BentoCheckbox v-model="termsAgreed" :disabled="interactionsDisabled" required>
                    {{ i18n.get('disputes.management.accept.common.agree') }}
                </BentoCheckbox>
            </div>
            <BentoAlert v-if="acceptError" type="critical" role="alert">
                <template #description>
                    {{ i18n.get('disputes.management.common.errors.unavailable') }}
                </template>
            </BentoAlert>
            <div class="adyen-pe-accept-dispute__actions">
                <BentoButtonActions :actions="actionButtons as BentoButtonActionsList" />
            </div>
        </template>
    </div>
</template>
