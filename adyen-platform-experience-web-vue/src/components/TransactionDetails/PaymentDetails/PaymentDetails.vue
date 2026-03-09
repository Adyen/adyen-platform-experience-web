<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoTabs, BentoTab } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import PaymentDetailsStatusBox from './PaymentDetailsStatusBox.vue';
import PaymentDetailsProperties from './PaymentDetailsProperties.vue';
import PaymentDetailsSummary from './PaymentDetailsSummary.vue';
import PaymentDetailsTimeline from './PaymentDetailsTimeline.vue';
import PaymentRefundAlerts from './PaymentRefundAlerts.vue';
import PaymentDetailsActions from './PaymentDetailsActions.vue';
import { TX_DATA_CLASS, TX_DATA_CONTAINER, TX_DETAILS_TABS, TX_TABS_CONTAINER } from '../constants';
import { ActiveView, DetailsTab, RefundedState, type TransactionDetails, type TransactionDetailsProps } from '../types';

const props = defineProps<{
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    extraFields: Record<string, any> | undefined;
    fullRefundFailed: boolean;
    fullRefundInProgress: boolean;
    refundAmounts: Readonly<Record<string, readonly number[] | undefined>>;
    refundAvailable: boolean;
    refundCurrency: string;
    refundDisabled: boolean;
    refundedAmount: number;
    refundedState: RefundedState;
    refundLocked: boolean;
    setActiveView: (activeView: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: any;
}>();

const { i18n } = useCoreContext();
const activeTab = ref<DetailsTab>();

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
const activeTabIndex = computed(() => navigationTabs.value.findIndex(({ id }) => id === activeTab.value));

// Set initial active tab
watch(
    navigationTabs,
    tabs => {
        if (tabs.length === 0) {
            activeTab.value = undefined;
            return;
        }

        if (!activeTab.value || !tabs.some(({ id }) => id === activeTab.value)) {
            activeTab.value = tabs[0]!.id;
        }
    },
    { immediate: true }
);

function onTabChange(tabIndex: number) {
    activeTab.value = navigationTabs.value[tabIndex]?.id ?? navigationTabs.value[0]?.id;
}
</script>

<template>
    <div :class="TX_DATA_CLASS">
        <PaymentDetailsStatusBox :refunded-state="props.refundedState" :transaction="props.transaction" />

        <div :class="TX_DATA_CONTAINER">
            <!-- Tabs navigation -->
            <div :class="TX_TABS_CONTAINER">
                <bento-tabs
                    v-if="navigationTabs.length > 1"
                    :aria-label="i18n.get('transactions.details.viewSelect.a11y.label')"
                    :active-tab-index="activeTabIndex > -1 ? activeTabIndex : 0"
                    @update:active-tab-index="onTabChange"
                >
                    <bento-tab v-for="tab in navigationTabs" :key="tab.id" :title="i18n.get(tab.label)" />
                </bento-tabs>
            </div>

            <!-- Tab content -->
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
