<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTabs, BentoTab } from '@adyen/bento-vue3';
import PaymentDetailsStatusBox from './PaymentDetailsStatusBox.vue';
import PaymentDetailsProperties from './PaymentDetailsProperties.vue';
import PaymentDetailsSummary from './PaymentDetailsSummary.vue';
import PaymentDetailsTimeline from './PaymentDetailsTimeline.vue';
import PaymentRefundAlerts from './PaymentRefundAlerts.vue';
import PaymentDetailsActions from './PaymentDetailsActions.vue';
import {
    TX_DETAILS_TABS,
    TX_DATA_CLASS,
    TX_DATA_CONTAINER,
    TX_DATA_TABS,
    ActiveView,
    DetailsTab,
    RefundedState,
    REFUND_STATUSES,
} from '@integration-components/transactions/domain';
import type { TransactionDetails, TransactionDetailsCustomization } from '@integration-components/transactions/domain';
import { useTransaction } from '../../composables/useTransaction.js';
import './PaymentDetails.scss';

type TransactionNavigatorState = ReturnType<typeof useTransaction>['transactionNavigator']['value'];

const props = defineProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    extraFields: Record<string, any> | undefined;
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<(typeof REFUND_STATUSES)[number], readonly number[] | undefined>>;
    refundAvailable: boolean;
    refundCurrency: string;
    refundDisabled: boolean;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
    setActiveView: (view: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: TransactionNavigatorState;
}>();

const { i18n } = useCoreContext();

const navigationTabs = computed(() =>
    TX_DETAILS_TABS.filter(({ id }) => {
        switch (id) {
            case DetailsTab.SUMMARY: {
                const { additions, deductions, originalAmount, amountBeforeDeductions, netAmount } = props.transaction;
                return (
                    (additions && additions.length > 0) ||
                    (deductions && deductions.length > 0) ||
                    (originalAmount && originalAmount.value !== amountBeforeDeductions.value) ||
                    netAmount.value !== amountBeforeDeductions.value
                );
            }
            case DetailsTab.TIMELINE:
                return props.transaction.events && props.transaction.events.length > 0;
            default:
                return true;
        }
    })
);

const activeTab = ref<DetailsTab | undefined>(navigationTabs.value[0]?.id);

const activeTabIndex = computed(() => {
    const idx = navigationTabs.value.findIndex(tab => tab.id === activeTab.value);
    return idx >= 0 ? idx : 0;
});

watch(navigationTabs, tabs => {
    if (!tabs.some(tab => tab.id === activeTab.value)) {
        activeTab.value = tabs[0]?.id;
    }
});

const onTabChange = (newIndex: number) => {
    activeTab.value = navigationTabs.value[newIndex]?.id;
};
</script>

<template>
    <div :class="TX_DATA_CLASS">
        <PaymentDetailsStatusBox :refunded-state="props.refundedState" :transaction="props.transaction" />

        <div :class="TX_DATA_CONTAINER">
            <BentoTabs
                v-if="navigationTabs.length > 1"
                :class="TX_DATA_TABS"
                :aria-label="i18n.get('transactions.details.viewSelect.a11y.label')"
                :active-tab-index="activeTabIndex"
                @update:active-tab-index="onTabChange"
            >
                <BentoTab v-for="tab in navigationTabs" :key="tab.id" :title="i18n.get(tab.label)" />
            </BentoTabs>

            <PaymentDetailsSummary v-if="activeTab === DetailsTab.SUMMARY" :transaction="props.transaction" />
            <PaymentDetailsProperties
                v-else-if="activeTab === DetailsTab.DETAILS"
                :data-customization="props.dataCustomization"
                :extra-fields="props.extraFields"
                :transaction="props.transaction"
            />
            <PaymentDetailsTimeline v-else-if="activeTab === DetailsTab.TIMELINE" :transaction="props.transaction" />
        </div>

        <PaymentRefundAlerts
            :full-refund-failed="props.fullRefundFailed"
            :full-refund-in-progress="props.fullRefundInProgress"
            :refund-amounts="props.refundAmounts"
            :refund-currency="props.refundCurrency"
            :refunded-amount="props.refundedAmount"
            :refunded-state="props.refundedState"
            :refund-locked="props.refundLocked"
        />

        <PaymentDetailsActions
            :extra-fields="props.extraFields"
            :refund-available="props.refundAvailable"
            :refund-disabled="props.refundDisabled"
            :set-active-view="props.setActiveView"
            :transaction="props.transaction"
            :transaction-navigator="props.transactionNavigator"
        />
    </div>
</template>
