<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { DISPUTE_PAYMENT_SCHEMES, DISPUTE_REASON_CATEGORIES } from '@integration-components/disputes/domain';
import { endOfDay, now, quickSelectDateRanges, startOfDay, toUTCISOStringKeepingLocalDateTime } from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { EARLIEST_DISPUTES_SINCE_DATE } from '../constants';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    statusGroup: IDisputeStatusGroup;
    onChange?: (params: {
        balanceAccountId: string | undefined;
        schemeCodes: string | undefined;
        reasonCategories: string | undefined;
        createdSince: string;
        createdUntil: string;
    }) => void;
}>();

const { i18n } = useCoreContext();

const DAY_MS = 24 * 60 * 60 * 1000;
const earliestDate = startOfDay(new Date(EARLIEST_DISPUTES_SINCE_DATE));

const last90DaysRange: BentoDateRangePickerValue = {
    startDate: startOfDay(new Date(now.getTime() - 89 * DAY_MS)),
    endDate: new Date(now),
    range: 'last90Days',
};

function cloneDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    return {
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        ...(value.range ? { range: value.range } : {}),
    };
}

function normalizeDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    const normalizedRange = {
        startDate: startOfDay(value.startDate),
        endDate: endOfDay(value.endDate),
        ...(value.range ? { range: value.range } : {}),
    } satisfies BentoDateRangePickerValue;

    const matchingQuickSelectRange = [...Object.values(quickSelectDateRanges), last90DaysRange].find(
        range => range.startDate.getTime() === normalizedRange.startDate.getTime() && range.endDate.getTime() === normalizedRange.endDate.getTime()
    );

    return cloneDateRange(matchingQuickSelectRange ?? normalizedRange);
}

const defaultDateRange: BentoDateRangePickerValue = cloneDateRange(last90DaysRange);

const quickSelectRanges = [
    { label: i18n.get('common.filters.types.date.rangeSelect.options.last7Days'), value: 'last7Days', data: quickSelectDateRanges.last7Days },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.last30Days'), value: 'last30Days', data: quickSelectDateRanges.last30Days },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.last90Days'), value: 'last90Days', data: last90DaysRange },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.thisWeek'), value: 'thisWeek', data: quickSelectDateRanges.thisWeek },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.lastWeek'), value: 'lastWeek', data: quickSelectDateRanges.lastWeek },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.thisMonth'), value: 'thisMonth', data: quickSelectDateRanges.thisMonth },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.lastMonth'), value: 'lastMonth', data: quickSelectDateRanges.lastMonth },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.yearToDate'), value: 'yearToDate', data: quickSelectDateRanges.yearToDate },
];

const schemeItems = Object.entries(DISPUTE_PAYMENT_SCHEMES).map(([value, label]) => ({ label, value }));
const reasonItems = computed(() => Object.entries(DISPUTE_REASON_CATEGORIES).map(([value, labelKey]) => ({ label: i18n.get(labelKey), value })));

const hasBalanceAccountsFilter = (balanceAccounts: IBalanceAccountBase[] | undefined): balanceAccounts is IBalanceAccountBase[] =>
    !!balanceAccounts && balanceAccounts.length > 1;

const showReasonsFilter = computed(() => props.statusGroup !== 'FRAUD_ALERTS');

const selectedBalanceAccountId = ref<string | undefined>(undefined);
const selectedSchemes = ref<string[]>([]);
const selectedReasons = ref<string[]>([]);
const selectedDateRange = ref<BentoDateRangePickerValue>(cloneDateRange(defaultDateRange));

watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !accounts.some(account => account.id === selectedBalanceAccountId.value)) {
            selectedBalanceAccountId.value = accounts[0]?.id;
        }
    },
    { immediate: true }
);

const filterConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (hasBalanceAccountsFilter(props.balanceAccounts)) {
        filters.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: props.balanceAccounts[0]!.id,
            options: {
                listboxItems: props.balanceAccounts.map(a => ({
                    label: a.description || a.id,
                    value: a.id,
                    description: a.description ? a.id : undefined,
                })),
            },
        });
    }

    filters.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: defaultDateRange,
        options: { min: earliestDate, max: now, numberOfMonths: 1, quickSelectRanges },
    });

    filters.push({
        field: 'schemeCodes',
        label: i18n.get('disputes.overview.common.filters.types.paymentMethod'),
        type: BentoFilterItemType.CHECKBOX_GROUP,
        options: { checkboxItems: schemeItems },
    });

    if (showReasonsFilter.value) {
        filters.push({
            field: 'reasonCategories',
            label: i18n.get('disputes.overview.common.filters.types.disputeReason'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            options: { checkboxItems: reasonItems.value },
        });
    }

    return filters;
});

const filterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [{ field: 'dateRange', value: selectedDateRange.value }];

    if (hasBalanceAccountsFilter(props.balanceAccounts)) {
        values.push({ field: 'balanceAccountId', value: selectedBalanceAccountId.value });
    }

    values.push({ field: 'schemeCodes', value: selectedSchemes.value.length ? selectedSchemes.value : undefined });

    if (showReasonsFilter.value) {
        values.push({ field: 'reasonCategories', value: selectedReasons.value.length ? selectedReasons.value : undefined });
    }

    return values;
});

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'balanceAccountId') {
            selectedBalanceAccountId.value = fv.value as string | undefined;
        } else if (fv.field === 'dateRange') {
            selectedDateRange.value = fv.value ? normalizeDateRange(fv.value as BentoDateRangePickerValue) : cloneDateRange(defaultDateRange);
        } else if (fv.field === 'schemeCodes') {
            selectedSchemes.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'reasonCategories') {
            selectedReasons.value = (fv.value as string[]) ?? [];
        }
    }
}

const currentFilterParams = computed(() => {
    const fromMs = Math.max(selectedDateRange.value.startDate.getTime(), earliestDate.getTime());
    const untilMs = Math.min(selectedDateRange.value.endDate.getTime(), Date.now());
    return {
        balanceAccountId: selectedBalanceAccountId.value,
        schemeCodes: selectedSchemes.value.length ? selectedSchemes.value.join(',') : undefined,
        reasonCategories: showReasonsFilter.value && selectedReasons.value.length ? selectedReasons.value.join(',') : undefined,
        createdSince: toUTCISOStringKeepingLocalDateTime(new Date(fromMs)),
        createdUntil: toUTCISOStringKeepingLocalDateTime(new Date(untilMs)),
    };
});

watch(
    currentFilterParams,
    params => {
        props.onChange?.(params);
    },
    { deep: true, immediate: true }
);
</script>

<template>
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
</template>
