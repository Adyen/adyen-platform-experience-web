<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoDateRangePickerValue, BentoFilterBarModel, BentoFilterBarValue, BentoFilterValues } from '@adyen/bento-vue3';
import TransactionPspReferenceFilter from './TransactionPspReferenceFilter.vue';
import {
    sortMultiSelection,
    useBalanceAccountFilterState,
    useDateRangeFilterState,
    useSortedMultiSelection,
} from '@integration-components/composables-vue';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { createQuickSelectRanges, quickSelectDateRanges, startOfDay, now, DAY_IN_MS } from '@integration-components/utils';
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

const { filters, isTransactionsView, onFiltersChange, insightsCurrency, setInsightsCurrency, currenciesLookupResult } =
    useTransactionsOverviewContext();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const availableCurrencies = computed(() => currenciesLookupResult.sortedCurrencies.value);

const eventSubCategory = computed(() => {
    // prettier-ignore
    return isTransactionsView.value
        ? TRANSACTION_ANALYTICS_SUBCATEGORY_LIST
        : TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS;
});

// ── Local filter state (snapshot from shared state once, never read back from it) ──
const { selectedBalanceAccountId, hasMultipleBalanceAccounts, balanceAccountOptions } = useBalanceAccountFilterState({
    balanceAccounts: () => props.balanceAccounts,
    initialValue: filters.value.balanceAccountId,
});

watch(
    () => filters.value.balanceAccountId,
    newId => (selectedBalanceAccountId.value = newId)
);

const { selectedValues: selectedCategories, setSelectedValues: setSelectedCategories } = useSortedMultiSelection(filters.value.categories);
const { selectedValues: selectedStatuses } = useSortedMultiSelection(filters.value.statuses);
const { selectedValues: selectedCurrencies, setSelectedValues: setSelectedCurrencies } = useSortedMultiSelection(filters.value.currencies);
const selectedBalanceAccount = computed(() => props.balanceAccounts?.find(({ id }) => id === selectedBalanceAccountId.value));
const selectedPspReference = ref<string | undefined>(filters.value.paymentPspReference);

const { defaultDateRange, selectedDateRange, getDateRangeFilterOptions, getDateRangeQueryParams } = useDateRangeFilterState({
    defaultValue: quickSelectDateRanges.last180Days,
    initialValue: {
        startDate: new Date(filters.value.createdSince),
        endDate: new Date(filters.value.createdUntil),
    },
    earliestDate: startOfDay(getEarliestTransactionDate(now)),
    timezone: () => selectedBalanceAccount.value?.timeZone,
});

const dateRangeDefaultValue = {
    startDate: new Date(defaultDateRange.startDate),
    endDate: new Date(defaultDateRange.endDate),
};

// These defaults are fixed at mount, so returning a changed filter to its original value is tracked as a reset.
const initialDefaultFilterValueSnapshot = {
    categories: [...selectedCategories.value],
    currencies: [...selectedCurrencies.value],
    paymentPspReference: selectedPspReference.value || undefined,
    statuses: [...selectedStatuses.value],
    dateRange: {
        startDate: new Date(selectedDateRange.value.startDate),
        endDate: new Date(selectedDateRange.value.endDate),
    },
};

// Balance accounts arrive asynchronously, so their default must remain reactive until the first account is available.
const initialDefaultFilterValues = computed(() => ({
    balanceAccountId: props.balanceAccounts?.[0]?.id ?? selectedBalanceAccountId.value,
    ...initialDefaultFilterValueSnapshot,
}));

// When balance account changes, reset currency filter
watch(selectedBalanceAccountId, (newId, oldId) => {
    if (newId !== oldId) {
        setSelectedCurrencies();
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
        last180Days: quickSelectDateRanges.last180Days,
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

    if (hasMultipleBalanceAccounts.value) {
        items.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: balanceAccountOptions.value[0]?.value,
            options: {
                listboxItems: balanceAccountOptions.value,
            },
        });
    }

    items.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: dateRangeDefaultValue,
        options: {
            numberOfMonths: 1,
            ...getDateRangeFilterOptions({ quickSelectRanges, disableUnavailableDates: true }),
        },
    });

    return items;
});

const sharedFilterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [{ field: 'dateRange', value: selectedDateRange.value }];

    if (hasMultipleBalanceAccounts.value) {
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

        if (availableCurrencies.value.length > 1) {
            config.push({
                field: 'currencies',
                label: i18n.get('transactions.overview.filters.types.currency.label'),
                type: BentoFilterItemType.SELECT_CURRENCY,
                options: {
                    listboxItems: availableCurrencies.value.map(c => ({ label: c, value: c })),
                    multiple: true,
                },
            });
        }

        config.push({
            field: 'paymentPspReference',
            label: i18n.get('transactions.overview.filters.types.paymentPspReference.label'),
            type: TransactionPspReferenceFilter,
            options: {
                placeholder: i18n.get('transactions.overview.filters.types.paymentPspReference.placeholder'),
            },
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

function getCustomDateRangeEventValue(dateRange: BentoDateRangePickerValue) {
    const startTimestamp = dateRange.startDate.getTime();
    return `${startTimestamp},${Math.min(startTimestamp + DAY_IN_MS, Date.now())}`;
}

function fireFilterEvent(field: string, value: unknown, actionType?: 'reset' | 'update') {
    const label = FILTER_LABELS[field];
    if (!label) return;

    const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
    const eventActionType = actionType ?? (isEmpty ? 'reset' : 'update');
    // PSP reference value is always null to avoid accidentally leaking PII
    const dateRange = value as BentoDateRangePickerValue | undefined;

    let eventValue: MixpanelProperty | null | undefined;

    if (eventActionType === 'update') {
        if (field === 'paymentPspReference') {
            eventValue = null;
        } else if (field === 'dateRange' && dateRange) {
            eventValue = quickSelectRanges.find(range => range.value === dateRange.range)?.label ?? getCustomDateRangeEventValue(dateRange);
        } else if (Array.isArray(value)) {
            eventValue = String(value);
        } else {
            eventValue = value as MixpanelProperty;
        }
    }

    userEvents.addModifyFilterEvent?.({
        category: TRANSACTION_ANALYTICS_CATEGORY,
        subCategory: eventSubCategory.value,
        label,
        actionType: eventActionType,
        ...(eventValue !== undefined && { value: eventValue }),
    });
}

function hasFilterValueChanged(field: string, value: unknown) {
    switch (field) {
        case 'balanceAccountId':
            return selectedBalanceAccountId.value !== value;
        case 'dateRange': {
            const dateRange = value as BentoDateRangePickerValue | undefined;
            return (
                !dateRange ||
                selectedDateRange.value.startDate.getTime() !== dateRange.startDate.getTime() ||
                selectedDateRange.value.endDate.getTime() !== dateRange.endDate.getTime()
            );
        }
        case 'categories':
            return JSON.stringify(selectedCategories.value) !== JSON.stringify(value ?? []);
        case 'currencies':
            return JSON.stringify(selectedCurrencies.value) !== JSON.stringify(value ?? []);
        case 'paymentPspReference':
            return selectedPspReference.value !== (value || undefined);
        default:
            return false;
    }
}

function normalizeFilterValue(field: string, value: unknown): BentoFilterBarValue | undefined {
    switch (field) {
        case 'categories':
        case 'currencies':
        case 'statuses':
            return sortMultiSelection((value as string[]) ?? []);
        case 'paymentPspReference':
            return (value as string) || undefined;
        default:
            return value as BentoFilterBarValue | undefined;
    }
}

function isDefaultFilterValue(field: string, value: unknown) {
    const defaults = initialDefaultFilterValues.value;

    switch (field) {
        case 'balanceAccountId':
            return value === defaults.balanceAccountId;
        case 'categories':
        case 'currencies':
        case 'statuses':
            return JSON.stringify(value) === JSON.stringify(defaults[field]);
        case 'paymentPspReference':
            return value === defaults.paymentPspReference;
        case 'dateRange': {
            const dateRange = value as BentoDateRangePickerValue | undefined;
            return (
                !!dateRange &&
                dateRange.startDate.getTime() === defaults.dateRange.startDate.getTime() &&
                dateRange.endDate.getTime() === defaults.dateRange.endDate.getTime()
            );
        }
        default:
            return false;
    }
}

function normalizeFilterValues(updatedValues: BentoFilterValues) {
    return updatedValues.map(filterValue => ({
        ...filterValue,
        value: normalizeFilterValue(filterValue.field, filterValue.value),
    }));
}

function areAllChangedFiltersReset(values: BentoFilterValues) {
    const changedValues = values.filter(filterValue => hasFilterValueChanged(filterValue.field, filterValue.value));
    return changedValues.length > 1 && changedValues.every(filterValue => isDefaultFilterValue(filterValue.field, filterValue.value));
}

function updateFilterState(field: string, value: unknown) {
    switch (field) {
        case 'balanceAccountId':
            selectedBalanceAccountId.value = value as string | undefined;
            break;
        case 'dateRange':
            if (value) {
                selectedDateRange.value = value as BentoDateRangePickerValue;
            }
            break;
        case 'categories':
            setSelectedCategories(value as TransactionsFilters['categories']);
            break;
        case 'currencies':
            setSelectedCurrencies(value as string[]);
            break;
        case 'paymentPspReference':
            selectedPspReference.value = (value as string) || undefined;
            break;
    }
}

function reportFilterChange(field: string, value: unknown, previousPspReference: string | undefined, resetAllFilters: boolean) {
    // Always tracks balance account changes as updates, including a return to the initial balance account.
    let isResettingFilter = field !== 'balanceAccountId';

    if (resetAllFilters) {
        isResettingFilter &&= resetAllFilters;
    } else {
        isResettingFilter &&= isDefaultFilterValue(field, value);
        const isResettingDateRange = isResettingFilter && field === 'dateRange';
        const isResettingPspReference = isResettingFilter && field === 'paymentPspReference' && previousPspReference;

        if (isResettingDateRange) {
            fireFilterEvent(field, { ...(value as BentoDateRangePickerValue), range: defaultDateRange.range }, 'update');
        } else if (isResettingPspReference) {
            fireFilterEvent(field, value, 'update');
        }
    }

    fireFilterEvent(field, value, isResettingFilter ? 'reset' : 'update');
}

function onFilterInput(updatedValues: BentoFilterValues) {
    const normalizedValues = normalizeFilterValues(updatedValues);
    const resetAllFilters = areAllChangedFiltersReset(normalizedValues);

    for (const fv of normalizedValues) {
        const value = fv.value;
        const changed = hasFilterValueChanged(fv.field, value);
        const previousPspReference = selectedPspReference.value;

        updateFilterState(fv.field, value);

        if (changed) {
            reportFilterChange(fv.field, value, previousPspReference, resetAllFilters);
        }
    }
}

// Propagate filter changes upward — watch individual local refs to avoid circular deps
function buildFilterParams(): TransactionsFilters {
    return {
        balanceAccountId: selectedBalanceAccountId.value,
        categories: selectedCategories.value as any,
        statuses: selectedStatuses.value as any,
        currencies: selectedCurrencies.value as any,
        ...getDateRangeQueryParams(),
        paymentPspReference: selectedPspReference.value,
    };
}

watch(
    [selectedBalanceAccountId, selectedCategories, selectedStatuses, selectedCurrencies, selectedDateRange, selectedPspReference],
    () => onFiltersChange(buildFilterParams()),
    { immediate: true }
);

// Insights-only filter config — separate from filterConfig so it never influences the transactions tab
const insightsFilterConfig = computed<BentoFilterBarModel>(() => {
    const config = [...sharedFilterItems.value];

    if (availableCurrencies.value.length > 1) {
        config.push({
            field: 'insightsCurrency',
            label: i18n.get('transactions.overview.filters.types.currency.label'),
            type: BentoFilterItemType.SELECT_CURRENCY,
            defaultValue: insightsCurrency.value,
            options: {
                listboxItems: availableCurrencies.value.map(c => ({ label: c, value: c })),
            },
        });
    }

    return config;
});

const insightsFilterValues = computed<BentoFilterValues>(() => {
    const values = [...sharedFilterValues.value];
    values.push({ field: 'insightsCurrency', value: insightsCurrency.value });
    return values;
});

function onInsightsFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        const changed = fv.field === 'insightsCurrency' ? insightsCurrency.value !== fv.value : hasFilterValueChanged(fv.field, fv.value);

        switch (fv.field) {
            case 'balanceAccountId':
                selectedBalanceAccountId.value = fv.value as string | undefined;
                break;
            case 'dateRange':
                if (fv.value) selectedDateRange.value = fv.value as BentoDateRangePickerValue;
                break;
            case 'insightsCurrency':
                setInsightsCurrency((fv.value as string) || undefined);
                break;
        }

        if (changed) fireFilterEvent(fv.field, fv.value);
    }
}
</script>

<template>
    <BentoFilterBar v-if="isTransactionsView" :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
    <BentoFilterBar v-else :config="insightsFilterConfig" :filter-values="insightsFilterValues" @input="onInsightsFilterInput" />
</template>
