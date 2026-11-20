<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { ResponsiveButtonActions } from '@integration-components/composables-vue';
import { BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import CheckmarkIcon from '@adyen/ui-assets-icons-24/vue/checkmark-circle';
import CrossIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import type { RefundResult } from '../../../../../domain/src';
import styles from './PaymentRefund.module.scss';

const props = defineProps<{
    result: RefundResult;
    refreshTransaction: () => void;
    showDetails: () => void;
}>();

const { i18n } = useCoreContext();

const isError = computed(() => props.result === 'error');

const titleKey = computed(() => (isError.value ? 'transactions.common.errors.somethingWentWrong' : 'transactions.details.refund.alerts.refundSent'));
const descriptionKey = computed(() =>
    isError.value ? 'transactions.details.refund.alerts.refundFailure' : 'transactions.details.refund.alerts.refundSuccess'
);
const actionButtons = computed<BentoButtonActionsList>(() => [
    {
        title: i18n.get('transactions.common.goBack.label'),
        variant: 'secondary',
        event: () => {
            props.showDetails();
            props.refreshTransaction();
        },
    },
]);
</script>

<template>
    <div :class="styles.refundResponse">
        <CrossIcon v-if="isError" :class="styles.refundResponseIconError" />
        <CheckmarkIcon v-else :class="styles.refundResponseIconSuccess" />
        <BentoTypography variant="title" large>
            {{ i18n.get(titleKey) }}
        </BentoTypography>
        <BentoTypography variant="body">
            {{ i18n.get(descriptionKey) }}
        </BentoTypography>
        <ResponsiveButtonActions :actions="actionButtons" />
    </div>
</template>
