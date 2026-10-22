<script setup lang="ts">
import { BentoModal } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility } from '@integration-components/types';
import CashOutRequest from '../../../CashOutRequest/components/CashOutRequest/CashOutRequest.vue';

const props = defineProps<{
    balanceAccountId?: string;
    eligibility?: ICashOutEligibility;
    isOpen: boolean;
    onClose: () => void;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" @close-modal="props.onClose">
        {{ i18n.get('cashOut.request.title') }}
        <template #content>
            <!-- Mounted on open, so it starts from the balance account selected in the overview at that moment. -->
            <!-- Without onDismiss, so the modal's close button is the only way to close it, instead of a cancel button too. -->
            <CashOutRequest
                v-if="props.isOpen"
                :balance-account-id="props.balanceAccountId"
                :eligibility="props.eligibility"
                hide-title
                :on-contact-support="props.onContactSupport"
            />
        </template>
    </BentoModal>
</template>
