<script setup lang="ts">
import { computed } from 'vue';
import { DataOverviewError, useDataOverviewError } from '@integration-components/composables-vue';
import { BentoTypography, BentoDataGrid, BentoDivider } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import { getTransactionCategory } from '@integration-components/transactions/domain';
import type { CurrencyLookupRecord } from '../../composables/useCurrenciesLookup';
import type { useTransactionsTotals } from '../../composables/useTransactionsTotals';
import styles from './InsightsTotals.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS } from '../../../integration/translationKeys';

const props = defineProps<{
    currency?: string;
    currenciesLookupResult: ReturnType<typeof import('../../composables/useCurrenciesLookup').useCurrenciesLookup>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}>();

const { i18n } = useTransactionsContext();
const totalsErrorInfo = computed(() => ({
    title: 'transactions.errors.somethingWentWrong' as const,
    messages: ['transactions.errors.retry' as const],
    refreshComponent: true,
}));
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS,
    errorInfo: totalsErrorInfo,
    onRefresh: props.transactionsTotalsResult.refresh,
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});

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
    <div>
        <template v-if="isLoading">
            <div>
                <span />
                <div :class="styles.breakdowns">
                    <div v-for="n in 2" :key="n" :class="styles.breakdown">
                        <span />
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="props.transactionsTotalsResult.error.value">
            <div :class="styles.errorContainer">
                <DataOverviewError v-bind="errorPresentation" />
            </div>
        </template>

        <template v-else-if="data">
            <div :class="styles.amountDisplay">
                <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.periodResult') }}</BentoTypography>
                <div :class="styles.amountDisplayAmount">
                    <BentoTypography variant="title" medium>{{ i18n.amount(data.total, data.currency, { hideCurrency: true }) }}</BentoTypography>
                    <BentoTypography variant="title" medium>{{ data.currency }}</BentoTypography>
                </div>
            </div>

            <div :class="styles.breakdowns">
                <div :class="styles.breakdown">
                    <div :class="styles.amountDisplay">
                        <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.incoming') }}</BentoTypography>
                        <div :class="styles.amountDisplayAmount">
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
                        <BentoTypography variant="body">{{ i18n.get('transactions.overview.totals.tags.outgoing') }}</BentoTypography>
                        <div :class="styles.amountDisplayAmount">
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
