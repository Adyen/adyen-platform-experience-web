<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoButton, BentoButtonActions, BentoCheckbox, BentoTypography } from '@adyen/bento-vue3';
import SuccessIcon from '@adyen/ui-assets-icons-16/vue/checkmark-circle-fill';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { isFunction } from '@integration-components/utils';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import type { DisputeManagementProps } from '../types';

const props = defineProps<{
    onDisputeAccept?: DisputeManagementProps['onDisputeAccept'];
}>();

const { i18n } = useCoreContext();
const { acceptDispute } = useConfigContext().endpoints;
const { dispute, clearStates, goBack } = useDisputeFlow();
const cachedDispute = dispute.value;
const disputePspReference = cachedDispute?.dispute.pspReference;
const isRequestForInformation = cachedDispute?.dispute.type === 'REQUEST_FOR_INFORMATION';

const termsAgreed = ref(false);
const disputeAccepted = ref(false);
const isLoading = ref(false);
const callbackCalled = ref(false);

const acceptedLabel = computed(() =>
    isRequestForInformation
        ? i18n.get('disputes.management.accept.requestForInformation.accepted')
        : i18n.get('disputes.management.accept.chargeback.accepted')
);
const acceptDisclaimer = computed(() =>
    isRequestForInformation
        ? i18n.get('disputes.management.accept.requestForInformation.disclaimer')
        : i18n.get('disputes.management.accept.chargeback.disclaimer')
);
const acceptTitle = computed(() =>
    isRequestForInformation
        ? i18n.get('disputes.management.accept.requestForInformation.title')
        : i18n.get('disputes.management.accept.chargeback.title')
);
const acceptButtonTitle = computed(() =>
    isRequestForInformation
        ? i18n.get('disputes.management.accept.requestForInformation.actions.accept')
        : i18n.get('disputes.management.accept.chargeback.actions.accept')
);
const interactionsDisabled = computed(() => isLoading.value || disputeAccepted.value);
const canAcceptDispute = computed(() => termsAgreed.value && !interactionsDisabled.value && isFunction(acceptDispute) && !!disputePspReference);
const actionButtons = computed(() => [
    {
        title: acceptButtonTitle.value,
        disabled: !canAcceptDispute.value,
        event: () => void acceptDisputeCallback(),
        state: isLoading.value ? 'loading' : 'start',
    },
    {
        title: i18n.get('disputes.management.common.actions.goBack'),
        disabled: isLoading.value,
        event: goBack,
        variant: 'secondary',
    },
]);

async function acceptDisputeCallback() {
    if (!canAcceptDispute.value || !isFunction(acceptDispute) || !disputePspReference) return;

    isLoading.value = true;
    try {
        await acceptDispute({}, { path: { disputePspReference } });
        clearStates();
        disputeAccepted.value = true;
    } finally {
        isLoading.value = false;
    }
}

watch(disputeAccepted, accepted => {
    if (!accepted || callbackCalled.value || !disputePspReference || !isFunction(props.onDisputeAccept)) return;
    callbackCalled.value = true;
    props.onDisputeAccept({ id: disputePspReference });
});
</script>

<template>
    <div class="adyen-pe-accept-dispute__container">
        <div v-if="disputeAccepted" class="adyen-pe-accept-dispute__success">
            <SuccessIcon class="adyen-pe-accept-dispute__success-icon" aria-hidden="true" />
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
            <div class="adyen-pe-accept-dispute__actions">
                <BentoButtonActions :actions="actionButtons" />
            </div>
        </template>
    </div>
</template>
