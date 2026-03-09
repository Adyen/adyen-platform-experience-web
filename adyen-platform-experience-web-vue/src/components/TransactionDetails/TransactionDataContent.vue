<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import useRefundMetadata from './composables/useRefundMetadata';
import PaymentDetails from './PaymentDetails/PaymentDetails.vue';
import PaymentRefund from './PaymentRefund/PaymentRefund.vue';
import { ActiveView, type TransactionDetails, type TransactionDetailsProps } from './types';
import type { ILineItem } from './types';

const props = defineProps<{
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    fetchingTransaction: boolean;
    refreshTransaction: () => void;
    transaction: TransactionDetails;
    transactionNavigator: any;
}>();

const activeView = ref<ActiveView>(ActiveView.DETAILS);
const locked = ref(false);

const {
    fullRefundFailed,
    fullRefundInProgress,
    refundableAmount,
    refundAmounts,
    refundAvailable,
    refundCurrency,
    refundDisabled,
    refundedAmount,
    refundedState,
    refundMode,
    refundLocked,
} = useRefundMetadata(() => props.transaction);

const refundIsLocked = computed(() => refundLocked.value || locked.value);
const refundIsDisabled = computed(() => refundDisabled.value || refundIsLocked.value);

const lineItems = computed<readonly ILineItem[]>(() => Object.freeze(props.transaction.lineItems ?? []));

// Reset locked state when refundLocked changes
watch(refundLocked, val => {
    if (val) {
        locked.value = false;
    }
});

function setActiveView(view: ActiveView) {
    activeView.value = view;
}

function setLocked(val: boolean) {
    locked.value = val;
}
</script>

<template>
    <!-- Loading skeleton -->
    <template v-if="props.fetchingTransaction">
        <div class="adyen-pe-overview-details__skeleton">
            <div v-for="n in 5" :key="n" class="skeleton-row"></div>
        </div>
    </template>

    <!-- Refund view -->
    <template v-else-if="activeView === ActiveView.REFUND">
        <PaymentRefund
            :currency="refundCurrency"
            :disabled="refundIsDisabled"
            :line-items="lineItems"
            :max-amount="refundableAmount"
            :mode="refundMode"
            :refresh-transaction="props.refreshTransaction"
            :refunded-amount="refundedAmount"
            :refunding-amounts="refundAmounts.in_progress ?? []"
            :set-active-view="setActiveView"
            :set-locked="setLocked"
            :transaction="props.transaction"
        />
    </template>

    <!-- Details view (default) -->
    <template v-else>
        <PaymentDetails
            :data-customization="props.dataCustomization"
            :extra-fields="props.extraFields"
            :full-refund-failed="fullRefundFailed"
            :full-refund-in-progress="fullRefundInProgress"
            :refund-amounts="refundAmounts"
            :refund-available="refundAvailable"
            :refund-currency="refundCurrency"
            :refund-disabled="refundIsDisabled"
            :refunded-amount="refundedAmount"
            :refunded-state="refundedState"
            :refund-locked="refundIsLocked"
            :set-active-view="setActiveView"
            :transaction="props.transaction"
            :transaction-navigator="props.transactionNavigator"
        />
    </template>
</template>

<style scoped>
.skeleton-row {
    height: 20px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
</style>
