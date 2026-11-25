<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutEligibility, ICashOutResponse } from '@integration-components/types';
import { useCashOutAnalytics } from '../../../shared/composables/useCashOutAnalytics';
import CashOutRequest from '../../../CashOutRequest/components/CashOutRequest/CashOutRequest.vue';

const props = defineProps<{
    /** The balance account selected in the overview, which the request starts from. */
    initialBalanceAccountId?: string;
    eligibility?: ICashOutEligibility;
    /** Whether the overview is loading `eligibility` again, which the request then waits for. */
    isLoadingEligibility?: boolean;
    isOpen: boolean;
    referenceForBeneficiary?: string;
    transferDescription?: string;
    onSubmit: (cashOut: ICashOutResponse) => void;
    onClose: () => void;
    onContactSupport?: () => void;
    /** Called when the user tries again from the result of the request, so the overview loads its eligibility again. */
    onTryAgain?: () => void;
}>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();
const { track } = useCashOutAnalytics();

// The success and error screens have no title, so the modal drops its own once one is shown.
const isShowingResult = ref(false);
const showTitle = computed(() => !hideTitles.value && !isShowingResult.value);

// Closing the modal while the cashOut is sent would unmount the request, cancelling the cashOut in the browser while the server may
// still make it, and no result would be shown.
const isInstructing = ref(false);
const handleClose = () => {
    if (isInstructing.value) return;
    track('Clicked button', { label: 'Close', subCategory: 'Request', step: isShowingResult.value ? 'result' : 'form' });
    props.onClose();
};

// The form is shown again, with its title
const handleTryAgain = () => {
    isShowingResult.value = false;
    props.onTryAgain?.();
};

watch(
    () => props.isOpen,
    () => {
        isShowingResult.value = false;
        isInstructing.value = false;
    }
);
</script>

<template>
    <BentoModal
        :is-open="props.isOpen"
        size="medium"
        :aria-label="i18n.get('cashOut.request.title')"
        :is-dismissible="!isInstructing"
        :hide-close-button="isInstructing"
        @close-modal="handleClose"
    >
        <!-- In the modal header, so the title is on the same line as the close button. -->
        <template #default>
            <template v-if="showTitle">{{ i18n.get('cashOut.request.title') }}</template>
        </template>
        <template #content>
            <!-- Mounted on open, so it starts from the balance account selected in the overview at that moment. -->
            <CashOutRequest
                v-if="props.isOpen"
                :initial-balance-account-id="props.initialBalanceAccountId"
                :reference-for-beneficiary="props.referenceForBeneficiary"
                :transfer-description="props.transferDescription"
                :eligibility="props.eligibility"
                :is-loading-eligibility="props.isLoadingEligibility"
                hide-title
                in-modal
                :on-submit="props.onSubmit"
                :on-result-shown="() => (isShowingResult = true)"
                :on-try-again="handleTryAgain"
                :on-instructing-change="(value: boolean) => (isInstructing = value)"
                :on-contact-support="props.onContactSupport"
            />
        </template>
    </BentoModal>
</template>
