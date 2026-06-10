<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import './PaymentRefund.scss';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import CrossCircleFillIcon from '@adyen/ui-assets-icons-40/vue/cross-circle-filled';
import {
    TX_REFUND_RESPONSE,
    TX_REFUND_RESPONSE_ICON,
    TX_REFUND_RESPONSE_SUCCESS_ICON,
    TX_REFUND_RESPONSE_ERROR_ICON,
} from '@integration-components/transactions/domain';
import type { RefundResult } from '@integration-components/transactions/domain';

const props = defineProps<{
    result: RefundResult;
    refreshTransaction: () => void;
    showDetails: () => void;
}>();

const { i18n } = useCoreContext();

const isError = computed(() => props.result === 'error');

const titleKey = computed(() => (isError.value ? 'common.errors.somethingWentWrong' : 'transactions.details.refund.alerts.refundSent'));
const descriptionKey = computed(() =>
    isError.value ? 'transactions.details.refund.alerts.refundFailure' : 'transactions.details.refund.alerts.refundSuccess'
);
const iconClass = computed(() => [TX_REFUND_RESPONSE_ICON, isError.value ? TX_REFUND_RESPONSE_ERROR_ICON : TX_REFUND_RESPONSE_SUCCESS_ICON]);
</script>

<template>
    <div :class="TX_REFUND_RESPONSE">
        <CrossCircleFillIcon v-if="isError" :class="iconClass" />
        <CheckmarkCircleFillIcon v-else :class="iconClass" />
        <BentoTypography variant="title" large>
            {{ i18n.get(titleKey) }}
        </BentoTypography>
        <BentoTypography variant="body">
            {{ i18n.get(descriptionKey) }}
        </BentoTypography>
        <BentoButton
            variant="secondary"
            @click="
                () => {
                    props.showDetails();
                    props.refreshTransaction();
                }
            "
        >
            {{ i18n.get('transactions.details.refund.actions.back') }}
        </BentoButton>
    </div>
</template>
