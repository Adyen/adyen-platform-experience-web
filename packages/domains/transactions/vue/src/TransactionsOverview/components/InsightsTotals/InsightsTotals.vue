<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import { BentoTypography, BentoDataGrid, BentoDivider } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { getTransactionCategory } from '@integration-components/transactions/domain';
import type { CurrencyLookupRecord } from '../../composables/useCurrenciesLookup';
import type { useTransactionsTotals } from '../../composables/useTransactionsTotals';
import './InsightsTotals.scss';

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
    <div class="adyen-pe-transaction-insights-totals">
        <template v-if="isLoading">
            <div class="adyen-pe-transaction-insights-totals__skeleton adyen-pe-transaction-insights-totals__skeleton--loading">
                <span class="adyen-pe-transaction-insights-totals__skeleton--amount adyen-pe-transaction-insights-totals__skeleton--amount-large" />
                <div class="adyen-pe-transaction-insights-totals__breakdowns">
                    <div v-for="n in 2" :key="n" class="adyen-pe-transaction-insights-totals__breakdown">
                        <span class="adyen-pe-transaction-insights-totals__skeleton--amount" />
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="props.transactionsTotalsResult.error.value">
            <div class="adyen-pe-transaction-insights-totals__error-container">
                <ErrorMessageDisplay
                    :error-info="{ title: 'common.errors.somethingWentWrong', messages: ['common.errors.retry'], refreshComponent: true }"
                    :on-refresh="props.transactionsTotalsResult.refresh"
                    with-image
                    :outlined="false"
                    :absolute-position="false"
                    :with-background="false"
                />
            </div>
        </template>

        <template v-else-if="data">
            <div class="adyen-pe-transaction-amount-display adyen-pe-transaction-amount-display--large">
                <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.periodResult') }}</BentoTypography>
                <div class="adyen-pe-transaction-amount-display__amount">
                    <BentoTypography variant="title" medium>{{ i18n.amount(data.total, data.currency, { hideCurrency: true }) }}</BentoTypography>
                    <BentoTypography variant="title" medium>{{ data.currency }}</BentoTypography>
                </div>
            </div>

            <div class="adyen-pe-transaction-insights-totals__breakdowns">
                <div class="adyen-pe-transaction-insights-totals__breakdown">
                    <div class="adyen-pe-transaction-amount-display">
                        <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.incoming') }}</BentoTypography>
                        <div class="adyen-pe-transaction-amount-display__amount">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.amount(data.incomings, data.currency, { hideCurrency: true }) }}
                            </BentoTypography>
                            <BentoTypography variant="body" strongest>
                                {{ data.currency }}
                            </BentoTypography>
                        </div>
                    </div>
                    <BentoDataGrid
                        v-if="incomingsBreakdown.length"
                        class="adyen-pe-transaction-insights-totals__breakdown-list"
                        :columns="breakdownColumns"
                        :data="incomingsBreakdown"
                        :loading="false"
                        :has-resizable-columns="false"
                        :allow-column-drag-and-drop="false"
                        :allow-row-clicks="false"
                        condensed
                    />
                </div>

                <BentoDivider class="adyen-pe-transaction-insights-totals__divider" variant="vertical" />

                <div class="adyen-pe-transaction-insights-totals__breakdown">
                    <div class="adyen-pe-transaction-amount-display">
                        <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.outgoing') }}</BentoTypography>
                        <div class="adyen-pe-transaction-amount-display__amount">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.amount(data.expenses, data.currency, { hideCurrency: true }) }}
                            </BentoTypography>
                            <BentoTypography variant="body" strongest>
                                {{ data.currency }}
                            </BentoTypography>
                        </div>
                    </div>
                    <BentoDataGrid
                        v-if="expensesBreakdown.length"
                        class="adyen-pe-transaction-insights-totals__breakdown-list"
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
