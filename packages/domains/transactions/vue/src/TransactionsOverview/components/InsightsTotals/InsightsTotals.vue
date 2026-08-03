<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoButton, BentoTypography, BentoDataGrid, BentoDivider } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { getTransactionCategory } from '@integration-components/transactions/domain';
import type { CurrencyLookupRecord } from '../../composables/useCurrenciesLookup';
import type { useTransactionsTotals } from '../../composables/useTransactionsTotals';
import styles from './InsightsTotals.module.scss';

const props = defineProps<{
    currency?: string;
    currenciesLookupResult: ReturnType<typeof import('../../composables/useCurrenciesLookup').useCurrenciesLookup>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}>();

const { i18n } = useCoreContext();

const data = computed<CurrencyLookupRecord['totals'] | undefined>(() => {
    if (!props.currency) return undefined;
    return props.currenciesLookupResult.currenciesDictionary.value[props.currency]?.totals;
});

const isLoading = computed(() => props.transactionsTotalsResult.isWaiting.value);

function formatAmount(value: number, currency: string): string {
    return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
}

const breakdownColumns = computed<BentoColumn[]>(() => [
    { field: 'label', label: '', flex: 1 },
    { field: 'value', label: '', flex: 1, numeric: true },
]);

const incomingsBreakdown = computed<BentoDatagridDataItem[]>(() =>
    (data.value?.breakdown?.incomings ?? []).map((item: any, idx: number) => ({
        id: `incoming-${idx}`,
        label: getTransactionCategory(i18n, item.category) as string,
        value: formatAmount(item.value, data.value!.currency),
    }))
);

const expensesBreakdown = computed<BentoDatagridDataItem[]>(() =>
    (data.value?.breakdown?.expenses ?? []).map((item: any, idx: number) => ({
        id: `expense-${idx}`,
        label: getTransactionCategory(i18n, item.category) as string,
        value: formatAmount(item.value, data.value!.currency),
    }))
);
</script>

<template>
    <div :class="styles.root">
        <template v-if="isLoading">
            <div class="adyen-pe-transaction-insights-totals__skeleton adyen-pe-transaction-insights-totals__skeleton--loading">
                <span class="adyen-pe-transaction-insights-totals__skeleton--amount adyen-pe-transaction-insights-totals__skeleton--amount-large" />
                <div :class="styles.breakdowns">
                    <div v-for="n in 2" :key="n" :class="styles.breakdown">
                        <span class="adyen-pe-transaction-insights-totals__skeleton--amount" />
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="props.transactionsTotalsResult.error.value">
            <div class="adyen-pe-transaction-insights-totals__error-container">
                <BentoTypography variant="body">{{ i18n.get('common.errors.somethingWentWrong') }}</BentoTypography>
                <BentoButton
                    variant="tertiary"
                    :disabled="!props.transactionsTotalsResult.canRefresh.value"
                    @click="props.transactionsTotalsResult.refresh"
                >
                    {{ i18n.get('common.actions.refresh.labels.default') }}
                </BentoButton>
            </div>
        </template>

        <template v-else-if="data">
            <div :class="[styles.amountDisplay, 'adyen-pe-transaction-amount-display--large']">
                <BentoTypography variant="caption">{{ i18n.get('transactions.overview.totals.tags.periodResult') }}</BentoTypography>
                <div :class="styles.amountDisplayAmount">
                    <BentoTypography variant="title" large>{{ i18n.amount(data.total, data.currency) }}</BentoTypography>
                    <BentoTypography variant="title" stronger>{{ data.currency }}</BentoTypography>
                </div>
            </div>

            <div :class="styles.breakdowns">
                <div :class="styles.breakdown">
                    <div :class="styles.amountDisplay">
                        <BentoTypography variant="caption">{{ i18n.get('transactions.overview.totals.tags.incoming') }}</BentoTypography>
                        <BentoTypography variant="title" stronger>{{ i18n.amount(data.incomings, data.currency) }}</BentoTypography>
                        <BentoTypography variant="caption" stronger>{{ data.currency }}</BentoTypography>
                    </div>
                    <BentoDataGrid
                        v-if="incomingsBreakdown.length"
                        :class="styles.breakdownList"
                        :columns="breakdownColumns"
                        :data="incomingsBreakdown"
                        :loading="false"
                        :has-resizable-columns="false"
                        :allow-column-drag-and-drop="false"
                        :allow-row-clicks="false"
                        hide-header
                        condensed
                    />
                </div>

                <BentoDivider :class="styles.divider" variant="vertical" />

                <div :class="styles.breakdown">
                    <div :class="styles.amountDisplay">
                        <BentoTypography variant="caption">{{ i18n.get('transactions.overview.totals.tags.outgoing') }}</BentoTypography>
                        <BentoTypography variant="title" stronger>{{ i18n.amount(data.expenses, data.currency) }}</BentoTypography>
                        <BentoTypography variant="caption" stronger>{{ data.currency }}</BentoTypography>
                    </div>
                    <BentoDataGrid
                        v-if="expensesBreakdown.length"
                        :class="styles.breakdownList"
                        :columns="breakdownColumns"
                        :data="expensesBreakdown"
                        :loading="false"
                        :has-resizable-columns="false"
                        :allow-column-drag-and-drop="false"
                        :allow-row-clicks="false"
                        condensed
                    />
                </div>
            </div>
        </template>
    </div>
</template>
