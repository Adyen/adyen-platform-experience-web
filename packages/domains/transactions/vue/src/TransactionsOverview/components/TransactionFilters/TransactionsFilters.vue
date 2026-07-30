<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import {
    createQuickSelectRanges,
    quickSelectDateRanges,
    toUTCISOStringKeepingLocalDateTime,
    endOfDay,
    startOfDay,
    now,
} from '@integration-components/utils';
import {
    TRANSACTION_ANALYTICS_CATEGORY,
    TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
    TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
    getEarliestTransactionDate,
} from '@integration-components/transactions/domain';
import type { FilterType, MixpanelProperty } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { TRANSACTION_CATEGORIES } from '../../constants';
import type { IBalanceAccountBase, TransactionsFilters } from '../../types';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const { filters, isTransactionsView, onFiltersChange, insightsCurrency, setInsightsCurrency, currenciesLookupResult } =
    useTransactionsOverviewContext();

const availableCurrencies = computed(() => currenciesLookupResult.sortedCurrencies.value);

const eventSubCategory = computed(() =>
    isTransactionsView.value ? TRANSACTION_ANALYTICS_SUBCATEGORY_LIST : TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS
);

// ── Local filter state (snapshot from shared state once, never read back from it) ──
const selectedBalanceAccountId = ref<string | undefined>(filters.value.balanceAccountId);

watch(
    () => filters.value.balanceAccountId,
    newId => {
        selectedBalanceAccountId.value = newId;
    }
);
const selectedCategories = ref<string[]>([...(filters.value.categories as string[])]);
const selectedStatuses = ref<string[]>([...(filters.value.statuses as string[])]);
const selectedCurrencies = ref<string[]>([...(filters.value.currencies as string[])]);
const selectedPspReference = ref<string | undefined>(filters.value.paymentPspReference);

const defaultDateRange = quickSelectDateRanges.last30Days;
const earliestDate = startOfDay(getEarliestTransactionDate(now));

const dateRangeDefaultValue = {
    startDate: new Date(defaultDateRange.startDate),
    endDate: new Date(defaultDateRange.endDate),
};

const selectedDateRange = ref<BentoDateRangePickerValue>({
    startDate: new Date(filters.value.createdSince),
    endDate: new Date(filters.value.createdUntil),
});

// Auto-select first balance account
watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !selectedBalanceAccountId.value) {
            selectedBalanceAccountId.value = accounts[0]?.id;
        }
    },
    { immediate: true }
);

// When balance account changes, reset currency filter
watch(selectedBalanceAccountId, (newId, oldId) => {
    if (newId !== oldId) {
        selectedCurrencies.value = [];
        setInsightsCurrency(undefined);
    }
});

// Auto-select first currency for insights view when none is selected
watch(
    [() => currenciesLookupResult.defaultCurrencySortedCurrencies.value, isTransactionsView],
    ([currencies, inTransactionsView]) => {
        if (!inTransactionsView && currencies.length > 0 && !insightsCurrency.value) {
            setInsightsCurrency(currencies[0]);
        }
    },
    { immediate: true }
);

const quickSelectRanges = createQuickSelectRanges(
    {
        last7Days: quickSelectDateRanges.last7Days,
        last30Days: quickSelectDateRanges.last30Days,
        thisWeek: quickSelectDateRanges.thisWeek,
        lastWeek: quickSelectDateRanges.lastWeek,
        thisMonth: quickSelectDateRanges.thisMonth,
        lastMonth: quickSelectDateRanges.lastMonth,
        yearToDate: quickSelectDateRanges.yearToDate,
    },
    key => i18n.get(key)
);

const sharedFilterItems = computed<BentoFilterBarModel>(() => {
    const items: BentoFilterBarModel = [];

    if (props.balanceAccounts && props.balanceAccounts.length > 1) {
        items.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: props.balanceAccounts[0]?.id,
            options: {
                listboxItems: props.balanceAccounts.map((a: IBalanceAccountBase) => ({
                    label: a.description || a.id,
                    value: a.id,
                    description: a.description ? a.id : undefined,
                })),
            },
        });
    }

    items.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: dateRangeDefaultValue,
        options: {
            min: earliestDate,
            max: now,
            numberOfMonths: 1,
            quickSelectRanges,
            isDateDisabled: (date: Date) => date.getTime() < earliestDate.getTime() || date.getTime() > now.getTime(),
        },
    });

    return items;
});

const sharedFilterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [{ field: 'dateRange', value: selectedDateRange.value }];

    if (props.balanceAccounts && props.balanceAccounts.length > 1) {
        values.push({ field: 'balanceAccountId', value: selectedBalanceAccountId.value });
    }

    return values;
});

const filterConfig = computed<BentoFilterBarModel>(() => {
    const config = [...sharedFilterItems.value];

    if (isTransactionsView.value) {
        config.push({
            field: 'categories',
            label: i18n.get('transactions.overview.filters.types.category.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            options: {
                checkboxItems: TRANSACTION_CATEGORIES.map(c => ({ label: c, value: c })),
            },
        });

        config.push({
            field: 'currencies',
            label: i18n.get('transactions.overview.filters.types.currency.label'),
            type: BentoFilterItemType.SELECT_CURRENCY,
            options: {
                listboxItems: availableCurrencies.value.map(c => ({ label: c, value: c })),
                multiple: true,
            },
        });

        config.push({
            field: 'paymentPspReference',
            label: i18n.get('transactions.overview.filters.types.paymentPspReference.label'),
            type: BentoFilterItemType.INPUT,
        });
    }

    return config;
});

const filterValues = computed<BentoFilterValues>(() => {
    const values = [...sharedFilterValues.value];

    if (isTransactionsView.value) {
        values.push({ field: 'categories', value: selectedCategories.value?.length ? selectedCategories.value : undefined });
        values.push({ field: 'currencies', value: selectedCurrencies.value?.length ? selectedCurrencies.value : undefined });
        values.push({ field: 'paymentPspReference', value: selectedPspReference.value || undefined });
    }

    return values;
});

const FILTER_LABELS: Partial<Record<string, FilterType>> = {
    balanceAccountId: 'Balance account filter',
    dateRange: 'Date filter',
    categories: 'Category filter',
    currencies: 'Currency filter',
    paymentPspReference: 'PSP reference filter',
    insightsCurrency: 'Currency filter',
};

function fireFilterEvent(field: string, value: unknown) {
    const label = FILTER_LABELS[field];
    if (!label) return;
    const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
    const actionType = isEmpty ? 'reset' : 'update';
    // PSP reference value is always null to avoid accidentally leaking PII
    const eventValue = actionType === 'update' ? (field === 'paymentPspReference' ? null : (value as MixpanelProperty)) : undefined;
    userEvents.addModifyFilterEvent?.({
        category: TRANSACTION_ANALYTICS_CATEGORY,
        subCategory: eventSubCategory.value,
        label,
        actionType,
        ...(eventValue !== undefined && { value: eventValue }),
    });
}

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'balanceAccountId') {
            selectedBalanceAccountId.value = fv.value as string | undefined;
        } else if (fv.field === 'dateRange' && fv.value) {
            selectedDateRange.value = fv.value as BentoDateRangePickerValue;
        } else if (fv.field === 'categories') {
            selectedCategories.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'currencies') {
            selectedCurrencies.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'paymentPspReference') {
            selectedPspReference.value = (fv.value as string) || undefined;
        }
        fireFilterEvent(fv.field, fv.value);
    }
}

// Propagate filter changes upward — watch individual local refs to avoid circular deps
function buildFilterParams(): TransactionsFilters {
    const createdSince = new Date(Math.max(startOfDay(selectedDateRange.value.startDate).getTime(), earliestDate.getTime()));

    return {
        balanceAccountId: selectedBalanceAccountId.value,
        categories: selectedCategories.value as any,
        statuses: selectedStatuses.value as any,
        currencies: selectedCurrencies.value as any,
        createdSince: toUTCISOStringKeepingLocalDateTime(createdSince),
        createdUntil: toUTCISOStringKeepingLocalDateTime(endOfDay(selectedDateRange.value.endDate)),
        paymentPspReference: selectedPspReference.value,
    };
}

watch(
    [selectedBalanceAccountId, selectedCategories, selectedStatuses, selectedCurrencies, selectedDateRange, selectedPspReference],
    () => {
        onFiltersChange(buildFilterParams());
    },
    { immediate: true }
);

// Insights-only filter config — separate from filterConfig so it never influences the transactions tab
const insightsFilterConfig = computed<BentoFilterBarModel>(() => {
    const config = [...sharedFilterItems.value];

    config.push({
        field: 'insightsCurrency',
        label: i18n.get('transactions.overview.filters.types.currency.label'),
        type: BentoFilterItemType.SELECT_CURRENCY,
        defaultValue: insightsCurrency.value,
        options: {
            listboxItems: availableCurrencies.value.map(c => ({ label: c, value: c })),
        },
    });

    return config;
});

const insightsFilterValues = computed<BentoFilterValues>(() => {
    const values = [...sharedFilterValues.value];

    values.push({ field: 'insightsCurrency', value: insightsCurrency.value });

    return values;
});

function onInsightsFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'balanceAccountId') {
            selectedBalanceAccountId.value = fv.value as string | undefined;
        } else if (fv.field === 'dateRange' && fv.value) {
            selectedDateRange.value = fv.value as BentoDateRangePickerValue;
        } else if (fv.field === 'insightsCurrency') {
            setInsightsCurrency((fv.value as string) || undefined);
        }
        fireFilterEvent(fv.field, fv.value);
    }
}
</script>

<template>
    <BentoFilterBar v-if="isTransactionsView" :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
    <BentoFilterBar v-else :config="insightsFilterConfig" :filter-values="insightsFilterValues" @input="onInsightsFilterInput" />
</template>
