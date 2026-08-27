<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoDateRangePickerValue, BentoFilterBarModel, BentoFilterValues } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccountFilterState, useDateRangeFilterState } from '@integration-components/composables-vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import { EARLIEST_REPORT_SINCE_DATE } from '../../../../domain/src';
import { createQuickSelectRanges, quickSelectDateRanges, startOfDay } from '@integration-components/utils';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    onChange?: (params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) => void;
}>();

const { i18n } = useCoreContext();

const quickSelectRanges = createQuickSelectRanges(
    {
        last7Days: quickSelectDateRanges.last7Days,
        last30Days: quickSelectDateRanges.last30Days,
        last90Days: quickSelectDateRanges.last90Days,
        thisWeek: quickSelectDateRanges.thisWeek,
        lastWeek: quickSelectDateRanges.lastWeek,
        thisMonth: quickSelectDateRanges.thisMonth,
        lastMonth: quickSelectDateRanges.lastMonth,
        yearToDate: quickSelectDateRanges.yearToDate,
    },
    key => i18n.get(key)
);

const { selectedBalanceAccountId, hasMultipleBalanceAccounts, balanceAccountOptions } = useBalanceAccountFilterState({
    balanceAccounts: () => props.balanceAccounts,
});

const { defaultDateRange, selectedDateRange, normalizeDateRange, resetDateRange, getDateRangeFilterOptions, getDateRangeQueryParams } =
    useDateRangeFilterState({
        defaultValue: quickSelectDateRanges.last30Days,
        earliestDate: startOfDay(new Date(EARLIEST_REPORT_SINCE_DATE)),
        timezone: 'UTC',
    });

// ── BentoFilterBar config ──
const filterConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (hasMultipleBalanceAccounts.value) {
        filters.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: balanceAccountOptions.value[0]?.value,
            options: {
                listboxItems: balanceAccountOptions.value,
            },
        });
    }

    filters.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: defaultDateRange,
        options: {
            numberOfMonths: 1,
            ...getDateRangeFilterOptions({ quickSelectRanges }),
        },
    });

    return filters;
});

const filterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [];

    values.push({ field: 'dateRange', value: selectedDateRange.value });

    if (hasMultipleBalanceAccounts.value) {
        values.push({ field: 'balanceAccountId', value: selectedBalanceAccountId.value });
    }

    return values;
});

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'balanceAccountId') {
            selectedBalanceAccountId.value = fv.value as string | undefined;
        } else if (fv.field === 'dateRange') {
            if (fv.value) {
                selectedDateRange.value = normalizeDateRange(fv.value as BentoDateRangePickerValue);
            } else {
                resetDateRange();
            }
        }
    }
}

// ── Emit filter changes to parent ──
const currentFilterParams = computed(() => {
    return {
        balanceAccountId: selectedBalanceAccountId.value,
        ...getDateRangeQueryParams(),
    };
});

watch(currentFilterParams, params => props.onChange?.(params), { deep: true, immediate: true });
</script>

<template>
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
</template>
