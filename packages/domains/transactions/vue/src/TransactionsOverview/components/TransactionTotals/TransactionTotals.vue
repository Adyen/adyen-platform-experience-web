<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMaxWidths } from '../../composables/useMaxWidths';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmountWithCurrencyCode } from '@integration-components/core/Localization/amount/amount-util';
import { BentoCard, BentoLoadingIndicator, BentoDivider, useClickOutside } from '@adyen/bento-vue3';
import type { ITransactionTotal } from '@integration-components/types';
import TransactionTotalItem from './TransactionTotalItem.vue';
import styles from '../TransactionsOverview/TransactionsOverview.module.scss';

const props = defineProps<{
    totals: readonly Readonly<ITransactionTotal>[];
    loadingTotals: boolean;
}>();

const { i18n } = useCoreContext();

const formattedTotals = computed(() =>
    props.totals.map(t => ({
        ...t,
        formattedIncomings: formatAmountWithCurrencyCode(t.incomings, i18n.locale, t.currency),
        formattedExpenses: formatAmountWithCurrencyCode(t.expenses, i18n.locale, t.currency),
    }))
);

const open = ref(false);
const cardRef = ref<HTMLElement | null>(null);

const updateToggleState = () => {
    open.value = !open.value;
};

useClickOutside(cardRef, () => {
    open.value = false;
});

const { maxWidths, updateMaxWidths } = useMaxWidths();
</script>

<template>
    <!-- BentoCard evaluates slot presence on mount; re-keying forces re-creation 
      when the number of currencies changes so the #content slot is correctly detected -->
    <BentoCard
        ref="cardRef"
        :key="formattedTotals.length > 1 ? 'multi' : 'single'"
        :closed="!open"
        v-if="formattedTotals.length > 0 || loadingTotals"
        class="adyen-pe-transaction-totals adyen-pe-transactions-overview__summary-card"
        @click="updateToggleState"
        :clickable="formattedTotals.length > 1"
        :expandable="formattedTotals.length > 1"
    >
        <template #header>
            <div :class="[styles.summaryHeader, styles.summaryGroup]">
                <BentoLoadingIndicator v-if="loadingTotals" />
                <TransactionTotalItem
                    v-else-if="formattedTotals[0]"
                    :currency="formattedTotals[0].currency"
                    :formatted-incomings="formattedTotals[0].formattedIncomings"
                    :formatted-expenses="formattedTotals[0].formattedExpenses"
                    is-header
                    :widths="maxWidths"
                    @widths-set="updateMaxWidths"
                />
            </div>
        </template>
        <template #content v-if="formattedTotals.length > 1">
            <div :class="styles.summaryGroup">
                <div v-if="loadingTotals" class="adyen-pe-transaction-totals__loading">
                    <BentoLoadingIndicator />
                </div>
                <BentoDivider />
                <div :class="styles.expandedList">
                    <TransactionTotalItem
                        v-for="total in formattedTotals.slice(1)"
                        :key="total.currency"
                        :formatted-incomings="total.formattedIncomings"
                        :formatted-expenses="total.formattedExpenses"
                        :widths="maxWidths"
                        @widths-set="updateMaxWidths"
                    />
                </div>
            </div>
        </template>
    </BentoCard>
</template>
