<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoLoadingIndicator, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import PaymentDetails from '../PaymentDetails/PaymentDetails.vue';
import PaymentRefund from '../PaymentRefund/PaymentRefund.vue';
import { ActiveView } from '../../../../../domain/src';
import { EMPTY_ARRAY } from '@integration-components/utils';
import type { TransactionDetails, TransactionDetailsCustomization } from '../../../../../domain/src';
import type { ILineItem } from '@integration-components/types';
import type { useTransaction } from '../../composables/useTransaction';
import { useRefundMetadata } from '../../composables/useRefundMetadata';
import styles from './TransactionData.module.scss';

type TransactionNavigatorState = ReturnType<typeof useTransaction>['transactionNavigator']['value'];

const props = defineProps<{
    extraFields: Record<string, any> | undefined;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    fetchingTransaction: boolean;
    hideTitle?: boolean;
    refreshTransaction: () => void;
    transaction: TransactionDetails;
    transactionNavigator: TransactionNavigatorState;
}>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const shouldHideTitle = computed(() => props.hideTitle || withinModal);

const activeView = ref<ActiveView>(ActiveView.DETAILS);
const locked = ref(false);

const refundMeta = useRefundMetadata(() => props.transaction);

const refundIsLocked = computed(() => refundMeta.refundLocked.value || locked.value);
const refundIsDisabled = computed(() => refundMeta.refundDisabled.value || refundIsLocked.value);

const lineItems = computed<readonly ILineItem[]>(() => Object.freeze(props.transaction.lineItems ?? EMPTY_ARRAY));

watch(refundMeta.refundLocked, locked_ => {
    if (locked_) locked.value = false;
});
</script>

<template>
    <div v-if="!shouldHideTitle" :class="styles.title">
        <BentoTypography variant="title">{{ i18n.get('transactions.details.title') }}</BentoTypography>
    </div>

    <div v-if="props.fetchingTransaction" :class="styles.loading">
        <BentoLoadingIndicator />
    </div>

    <PaymentRefund
        v-else-if="activeView === ActiveView.REFUND"
        :currency="refundMeta.refundCurrency.value"
        :disabled="refundIsDisabled"
        :line-items="lineItems"
        :max-amount="refundMeta.refundableAmount.value"
        :mode="refundMeta.refundMode.value"
        :refresh-transaction="props.refreshTransaction"
        :refunded-amount="refundMeta.refundedAmount.value"
        :refunding-amounts="refundMeta.refundAmounts.value.in_progress ?? EMPTY_ARRAY"
        :set-active-view="(v: ActiveView) => (activeView = v)"
        :set-locked="(v: boolean) => (locked = v)"
        :transaction="props.transaction"
    />

    <PaymentDetails
        v-else
        :data-customization="props.dataCustomization"
        :extra-fields="props.extraFields"
        :full-refund-failed="refundMeta.fullRefundFailed.value"
        :full-refund-in-progress="refundMeta.fullRefundInProgress.value"
        :refund-amounts="refundMeta.refundAmounts.value"
        :refund-available="refundMeta.refundAvailable.value"
        :refund-currency="refundMeta.refundCurrency.value"
        :refund-disabled="refundIsDisabled"
        :refunded-amount="refundMeta.refundedAmount.value"
        :refunded-state="refundMeta.refundedState.value"
        :refund-locked="refundIsLocked"
        :set-active-view="(v: ActiveView) => (activeView = v)"
        :transaction="props.transaction"
        :transaction-navigator="props.transactionNavigator"
    />
</template>
