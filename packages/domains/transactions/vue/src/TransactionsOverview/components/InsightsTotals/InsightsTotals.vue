<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import { BentoTypography, BentoDivider } from '@adyen/bento-vue3';
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

const incomingsBreakdown = computed(() => {
    const totals = data.value;
    if (!totals) return [];
    return (totals.breakdown?.incomings ?? []).map((item, idx) => ({
        id: `incoming-${idx}`,
        label: getTransactionCategory(i18n, item.category) as string,
        value: formatAmount(item.value, totals.currency),
    }));
});

const expensesBreakdown = computed(() => {
    const totals = data.value;
    if (!totals) return [];
    return (totals.breakdown?.expenses ?? []).map((item, idx) => ({
        id: `expense-${idx}`,
        label: getTransactionCategory(i18n, item.category) as string,
        value: formatAmount(item.value, totals.currency),
    }));
});
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
            <ErrorMessageDisplay
                :error-info="{
                    title: 'transactions.common.errors.somethingWentWrong',
                    messages: ['transactions.common.errors.retry'],
                    refreshComponent: true,
                }"
                :on-refresh="props.transactionsTotalsResult.refresh"
                with-image
                :outlined="false"
                :absolute-position="false"
                :with-background="false"
            />
        </template>

        <template v-else-if="data">
            <div :class="styles.amountDisplay">
                <BentoTypography variant="body">
                    {{ i18n.get('transactions.overview.totals.tags.periodResult') }}
                </BentoTypography>
                <div :class="styles.amountDisplayAmount">
                    <BentoTypography variant="title" medium>
                        {{ i18n.amount(data.total, data.currency, { hideCurrency: true }) }}
                    </BentoTypography>
                    <BentoTypography variant="title" medium>
                        {{ data.currency }}
                    </BentoTypography>
                </div>
            </div>

            <div :class="styles.breakdowns">
                <div :class="styles.breakdown">
                    <div :class="styles.amountDisplay">
                        <BentoTypography variant="body">
                            {{ i18n.get('transactions.overview.totals.tags.incoming') }}
                        </BentoTypography>
                        <div :class="styles.amountDisplayAmount">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.amount(data.incomings, data.currency, { hideCurrency: true }) }}
                            </BentoTypography>
                            <BentoTypography variant="body" strongest>
                                {{ data.currency }}
                            </BentoTypography>
                        </div>
                    </div>
                    <BentoTypography v-if="incomingsBreakdown.length" el="div" rich-text>
                        <table :class="styles.breakdownTable">
                            <caption :class="styles.visuallyHidden">
                                {{
                                    i18n.get('transactions.overview.totals.tags.incoming')
                                }}
                            </caption>
                            <tbody>
                                <tr v-for="item in incomingsBreakdown" :key="item.id">
                                    <td>{{ item.label }}</td>
                                    <td :class="styles.amount">{{ item.value }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </BentoTypography>
                </div>

                <BentoDivider :class="styles.divider" variant="vertical" />

                <div :class="styles.breakdown">
                    <div :class="styles.amountDisplay">
                        <BentoTypography variant="body">
                            {{ i18n.get('transactions.overview.totals.tags.outgoing') }}
                        </BentoTypography>
                        <div :class="styles.amountDisplayAmount">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.amount(data.expenses, data.currency, { hideCurrency: true }) }}
                            </BentoTypography>
                            <BentoTypography variant="body" strongest>
                                {{ data.currency }}
                            </BentoTypography>
                        </div>
                    </div>
                    <BentoTypography v-if="expensesBreakdown.length" el="div" rich-text>
                        <table :class="styles.breakdownTable">
                            <caption :class="styles.visuallyHidden">
                                {{
                                    i18n.get('transactions.overview.totals.tags.outgoing')
                                }}
                            </caption>
                            <tbody>
                                <tr v-for="item in expensesBreakdown" :key="item.id">
                                    <td>{{ item.label }}</td>
                                    <td :class="styles.amount">{{ item.value }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </BentoTypography>
                </div>
            </div>
        </template>
    </div>
</template>
