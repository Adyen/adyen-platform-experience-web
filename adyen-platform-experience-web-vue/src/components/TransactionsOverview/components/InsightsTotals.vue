<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoButton, BentoLoadingIndicator } from '@adyen/bento-vue3';
import AmountDisplay from './AmountDisplay.vue';
import { useCoreContext } from '../../../core/Context';
import type { ITransactionTotal } from '../types';
import type { CurrencyLookupRecord } from '../composables/useCurrenciesLookup';

const props = defineProps<{
    currency?: string;
    currenciesDictionary: Readonly<Record<string, CurrencyLookupRecord>>;
    isWaiting: boolean;
    error?: Error;
    refresh: () => void;
    totals: readonly Readonly<ITransactionTotal>[];
}>();

const { i18n } = useCoreContext();

const data = computed(() => (props.currency && props.currenciesDictionary[props.currency]?.totals) || undefined);

const BASE_CLASS = 'adyen-pe-insights-totals';
</script>

<template>
    <div :class="BASE_CLASS">
        <!-- Loading state -->
        <template v-if="props.isWaiting || !data">
            <bento-loading-indicator />
        </template>

        <!-- Error state -->
        <template v-else-if="props.error">
            <div :class="`${BASE_CLASS}__error-container`">
                <p>{{ i18n.get('common.errors.somethingWentWrong') }}</p>
                <bento-button variant="secondary" @click="props.refresh">{{ i18n.get('common.errors.retry') }}</bento-button>
            </div>
        </template>

        <!-- Data display -->
        <template v-else>
            <AmountDisplay
                :amount="data.total"
                :currency="data.currency"
                :label="i18n.get('transactions.overview.totals.tags.periodResult')"
                :large="true"
            />

            <div :class="`${BASE_CLASS}__breakdowns`">
                <!-- Incoming breakdown -->
                <div :class="`${BASE_CLASS}__breakdown`">
                    <AmountDisplay
                        :amount="data.incomings"
                        :currency="data.currency"
                        :label="i18n.get('transactions.overview.totals.tags.incoming')"
                    />
                    <bento-structured-list layout="50-50">
                        <bento-structured-list-item
                            v-for="item in data.breakdown.incomings"
                            :key="item.category"
                            :label="i18n.get(`transactions.common.types.${item.category}`)"
                        >
                            {{ i18n.amount(item.value, data.currency) }} {{ data.currency }}
                        </bento-structured-list-item>
                    </bento-structured-list>
                </div>

                <!-- Outgoing breakdown -->
                <div :class="`${BASE_CLASS}__breakdown`">
                    <AmountDisplay
                        :amount="data.expenses"
                        :currency="data.currency"
                        :label="i18n.get('transactions.overview.totals.tags.outgoing')"
                    />
                    <bento-structured-list layout="50-50">
                        <bento-structured-list-item
                            v-for="item in data.breakdown.expenses"
                            :key="item.category"
                            :label="i18n.get(`transactions.common.types.${item.category}`)"
                        >
                            {{ i18n.amount(item.value, data.currency) }} {{ data.currency }}
                        </bento-structured-list-item>
                    </bento-structured-list>
                </div>
            </div>
        </template>
    </div>
</template>
