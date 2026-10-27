<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoDateRangePickerValue, BentoFilterBarModel, BentoFilterValues } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccountFilterState, useDateRangeFilterState } from '@integration-components/composables-vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import { createQuickSelectRanges, quickSelectDateRanges, startOfDay } from '@integration-components/utils';
import { EARLIEST_PAYOUT_SINCE_DATE } from '../constants';
import styles from './PayoutsFilters.module.scss';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    compact?: boolean;
    onChange?: (params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) => void;
}>();

const { i18n } = useCoreContext();
const earliestDate = startOfDay(new Date(EARLIEST_PAYOUT_SINCE_DATE));

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
    'payouts.overview.common.filters.types.date.rangeSelect.options.',
    key => i18n.get(key)
);

const { selectedBalanceAccountId, hasMultipleBalanceAccounts, balanceAccountOptions } = useBalanceAccountFilterState({
    balanceAccounts: () => props.balanceAccounts,
});

const { defaultDateRange, selectedDateRange, normalizeDateRange, resetDateRange, getDateRangeFilterOptions, getDateRangeQueryParams } =
    useDateRangeFilterState({
        defaultValue: quickSelectDateRanges.last30Days,
        earliestDate,
        timezone: 'UTC',
    });

// ── BentoFilterBar config ──
const filterConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (hasMultipleBalanceAccounts.value) {
        filters.push({
            field: 'balanceAccountId',
            label: i18n.get('payouts.overview.common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: balanceAccountOptions.value[0]?.value,
            visible: !props.compact,
            options: {
                listboxItems: balanceAccountOptions.value,
            },
        });
    }

    filters.push({
        field: 'dateRange',
        label: i18n.get('payouts.overview.common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: defaultDateRange,
        visible: !props.compact,
        options: {
            numberOfMonths: 1,
            ...getDateRangeFilterOptions({ quickSelectRanges, disableUnavailableDates: true }),
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
    <div :class="[styles.filtersContainer, props.compact ? styles.filtersContainerCompact : '']">
        <BentoFilterBar :config="filterConfig" :filter-values="filterValues" :show-applied-hidden-filters="false" @input="onFilterInput" />
    </div>
</template>
