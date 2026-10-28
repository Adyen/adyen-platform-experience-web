<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutEligibility, ICashOutResponse } from '@integration-components/types';
import CashOutRequest from '../../../CashOutRequest/components/CashOutRequest/CashOutRequest.vue';

const props = defineProps<{
    /** The balance account selected in the overview, which the request starts from. */
    initialBalanceAccountId?: string;
    eligibility?: ICashOutEligibility;
    isOpen: boolean;
    referenceForBeneficiary?: string;
    transferDescription?: string;
    onCashOutInstructed: (cashOut: ICashOutResponse) => void;
    onClose: () => void;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();

// The success and error screens have no title, so the modal drops its own once one is shown.
const isShowingResult = ref(false);
const showTitle = computed(() => !hideTitles.value && !isShowingResult.value);

watch(
    () => props.isOpen,
    () => {
        isShowingResult.value = false;
    }
);
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" :aria-label="i18n.get('cashOut.request.title')" @close-modal="props.onClose">
        <!-- In the modal header, so the title is on the same line as the close button. -->
        <template #default>
            <template v-if="showTitle">{{ i18n.get('cashOut.request.title') }}</template>
        </template>
        <template #content>
            <!-- Mounted on open, so it starts from the balance account selected in the overview at that moment. -->
            <!-- Without onDismiss, so the modal's close button is the only way to close it, instead of a cancel button too. -->
            <CashOutRequest
                v-if="props.isOpen"
                :initial-balance-account-id="props.initialBalanceAccountId"
                :reference-for-beneficiary="props.referenceForBeneficiary"
                :transfer-description="props.transferDescription"
                :eligibility="props.eligibility"
                hide-title
                :on-cash-out-instructed="props.onCashOutInstructed"
                :on-cash-out-result="() => (isShowingResult = true)"
                :on-contact-support="props.onContactSupport"
            />
        </template>
    </BentoModal>
</template>
