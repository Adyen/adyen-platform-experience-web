<script setup lang="ts">
import { ref, shallowRef, computed, watch, markRaw } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { INITIAL_FILTERS, TRANSACTION_CATEGORIES, TRANSACTION_DATE_RANGES } from '../constants';
import type { IBalanceAccountBase, TransactionsFilters as Filters, RangeTimestamps } from '../types';

const props = defineProps<{
    availableCurrencies: readonly string[];
    balanceAccounts?: IBalanceAccountBase[];
    isTransactionsView: boolean;
    insightsCurrency?: string;
    onChange?: (filters: Readonly<Filters>) => void;
    setInsightsCurrency?: (currency?: string) => void;
}>();

const { i18n } = useCoreContext();

// Filter state
const statuses = ref<readonly string[]>([...INITIAL_FILTERS.statuses]);
const categories = ref<readonly string[]>([...INITIAL_FILTERS.categories]);
const currencies = ref<readonly string[]>([...INITIAL_FILTERS.currencies]);
const createdDate = shallowRef<RangeTimestamps>(INITIAL_FILTERS.createdDate);
const paymentPspReference = ref<string | undefined>(INITIAL_FILTERS.paymentPspReference);
const balanceAccount = ref<IBalanceAccountBase | undefined>(INITIAL_FILTERS.balanceAccount);

const currentFilters = computed<Readonly<Filters>>(() => ({
    balanceAccount: balanceAccount.value,
    categories: categories.value as any,
    createdDate: createdDate.value,
    currencies: currencies.value as any,
    paymentPspReference: paymentPspReference.value,
    statuses: statuses.value as any,
}));

// Auto-select first balance account when available
watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !balanceAccount.value) {
            balanceAccount.value = accounts[0];
        }
    },
    { immediate: true }
);

// Emit filter changes
watch(
    currentFilters,
    newFilters => {
        props.onChange?.(newFilters);
    },
    { deep: true }
);

// Date range listbox items
const dateRangeItems = computed(() =>
    Object.keys(TRANSACTION_DATE_RANGES).map(key => ({
        label: i18n.get(key),
        value: key,
    }))
);

// Balance account dropdown items
const balanceAccountItems = computed(() =>
    (props.balanceAccounts ?? []).map(a => ({
        label: a.description || a.id,
        value: a.id,
    }))
);

// Category listbox items
const categoryListboxItems = computed(() =>
    TRANSACTION_CATEGORIES.map(c => ({
        label: i18n.get(`transactions.common.types.${c}`),
        value: c,
    }))
);

// Currency listbox items
const currencyListboxItems = computed(() =>
    (props.availableCurrencies ?? []).map(c => ({
        label: c,
        value: c,
    }))
);

// BentoFilterBar config for transactions view
const filterBarConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (props.balanceAccounts && props.balanceAccounts.length > 1) {
        filters.push({
            field: 'balanceAccount',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            options: { listboxItems: balanceAccountItems.value },
        });
    }

    filters.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.SELECT,
        options: { listboxItems: dateRangeItems.value },
    });

    if (props.isTransactionsView) {
        if (categoryListboxItems.value.length > 1) {
            filters.push({
                field: 'categories',
                label: i18n.get('transactions.overview.filters.types.category.label'),
                type: BentoFilterItemType.SELECT,
                options: { listboxItems: categoryListboxItems.value, multiple: true },
            });
        }

        if (currencyListboxItems.value.length > 1) {
            filters.push({
                field: 'currencies',
                label: i18n.get('transactions.overview.filters.types.currency.label'),
                type: BentoFilterItemType.SELECT,
                options: { listboxItems: currencyListboxItems.value, multiple: true },
            });
        }

        filters.push({
            field: 'paymentPspReference',
            label: i18n.get('transactions.overview.filters.types.paymentPspReference.label'),
            type: BentoFilterItemType.INPUT,
        });
    } else {
        if (currencyListboxItems.value.length > 1) {
            filters.push({
                field: 'insightsCurrency',
                label: i18n.get('transactions.overview.filters.types.currency.label'),
                type: BentoFilterItemType.SELECT,
                options: { listboxItems: currencyListboxItems.value },
            });
        }
    }

    return markRaw(filters);
});

function buildFilterValuesObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    if (balanceAccount.value) obj.balanceAccount = balanceAccount.value.id;
    const dateRangeMatch = Object.entries(TRANSACTION_DATE_RANGES).find(([, timestamps]) => timestamps === createdDate.value);
    obj.dateRange = dateRangeMatch ? dateRangeMatch[0] : undefined;
    if (props.isTransactionsView) {
        obj.categories = categories.value.length ? [...categories.value] : undefined;
        obj.currencies = currencies.value.length ? [...currencies.value] : undefined;
        obj.paymentPspReference = paymentPspReference.value || undefined;
    } else {
        obj.insightsCurrency = props.insightsCurrency;
    }
    return obj;
}

const filterValuesObject = shallowRef<Record<string, any>>(buildFilterValuesObject());

function handleFilterUpdate(newValues: Record<string, any>) {
    // Only reassign filterValuesObject when values actually changed to prevent
    // a recursive loop: config change → BentoFilterBar re-emits → reassign → re-emit.
    if (JSON.stringify(newValues) === JSON.stringify(filterValuesObject.value)) return;
    filterValuesObject.value = newValues;

    // Sync back to internal filter state — only update refs when values actually changed
    // to prevent a feedback loop (fetch → currencies update → config change → emit → update → fetch)
    if (newValues.balanceAccount) {
        const account = props.balanceAccounts?.find(a => a.id === newValues.balanceAccount);
        if (account && account.id !== balanceAccount.value?.id) balanceAccount.value = account;
    }

    if (newValues.dateRange) {
        const range = TRANSACTION_DATE_RANGES[newValues.dateRange];
        if (range && range !== createdDate.value) createdDate.value = range;
    } else if (createdDate.value !== INITIAL_FILTERS.createdDate) {
        createdDate.value = INITIAL_FILTERS.createdDate;
    }

    if (props.isTransactionsView) {
        const newCategories = Array.isArray(newValues.categories) ? newValues.categories : [];
        if (String(newCategories) !== String(categories.value)) categories.value = newCategories;

        const newCurrencies = Array.isArray(newValues.currencies) ? newValues.currencies : [];
        if (String(newCurrencies) !== String(currencies.value)) currencies.value = newCurrencies;

        const newPspRef = newValues.paymentPspReference || undefined;
        if (newPspRef !== paymentPspReference.value) paymentPspReference.value = newPspRef;
    } else {
        if (newValues.insightsCurrency !== undefined) {
            props.setInsightsCurrency?.(newValues.insightsCurrency);
        }
    }
}
</script>

<template>
    <bento-filter-bar
        :config="filterBarConfig"
        :filter-values-object="filterValuesObject"
        :aria-label="i18n.get('transactions.overview.filters.label')"
        @update:filter-values-object="handleFilterUpdate"
    />
</template>
