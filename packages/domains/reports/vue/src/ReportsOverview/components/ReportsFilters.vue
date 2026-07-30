<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import { EARLIEST_PAYOUT_SINCE_DATE } from '../../../../domain/src';
import {
    createQuickSelectRanges,
    endOfDay,
    now,
    quickSelectDateRanges,
    startOfDay,
    toUTCISOStringKeepingLocalDateTime,
} from '@integration-components/utils';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    onChange?: (params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) => void;
}>();

const { i18n } = useCoreContext();

function cloneDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    return {
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        ...(value.granularity ? { granularity: value.granularity } : {}),
        ...(value.range ? { range: value.range } : {}),
    };
}

const earliestDate = startOfDay(new Date(EARLIEST_PAYOUT_SINCE_DATE));

function normalizeDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    const normalizedRange = {
        startDate: startOfDay(value.startDate),
        endDate: endOfDay(value.endDate),
        ...(value.granularity ? { granularity: value.granularity } : {}),
        ...(value.range ? { range: value.range } : {}),
    } satisfies BentoDateRangePickerValue;

    const matchingQuickSelectRange = Object.values(quickSelectDateRanges).find(range => {
        return range.startDate.getTime() === normalizedRange.startDate.getTime() && range.endDate.getTime() === normalizedRange.endDate.getTime();
    });

    return cloneDateRange(matchingQuickSelectRange ?? normalizedRange);
}

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

const defaultDateRange = cloneDateRange(quickSelectDateRanges.last30Days);

// ── Reactive filter state ──
const selectedBalanceAccountId = ref<string | undefined>(undefined);
const selectedDateRange = ref<BentoDateRangePickerValue>(cloneDateRange(defaultDateRange));

// Auto-select first balance account when available
watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !selectedBalanceAccountId.value) {
            selectedBalanceAccountId.value = accounts[0]?.id;
        }
    },
    { immediate: true }
);

// ── BentoFilterBar config ──
const filterConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (props.balanceAccounts && props.balanceAccounts.length > 1) {
        filters.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            defaultValue: props.balanceAccounts[0]!.id,
            options: {
                listboxItems: props.balanceAccounts.map((a: IBalanceAccountBase) => ({
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
        options: {
            min: earliestDate,
            max: now,
            numberOfMonths: 1,
            quickSelectRanges,
        },
    });

    return filters;
});

const filterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [];

    values.push({ field: 'dateRange', value: selectedDateRange.value });

    if (props.balanceAccounts && props.balanceAccounts.length > 1) {
        values.push({ field: 'balanceAccountId', value: selectedBalanceAccountId.value });
    }

    return values;
});

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'balanceAccountId') {
            selectedBalanceAccountId.value = fv.value as string | undefined;
        } else if (fv.field === 'dateRange') {
            selectedDateRange.value = fv.value ? normalizeDateRange(fv.value as BentoDateRangePickerValue) : cloneDateRange(defaultDateRange);
        }
    }
}

// ── Emit filter changes to parent ──
const currentFilterParams = computed(() => {
    const fromMs = Math.max(selectedDateRange.value.startDate.getTime(), earliestDate.getTime());
    return {
        balanceAccountId: selectedBalanceAccountId.value,
        createdSince: toUTCISOStringKeepingLocalDateTime(new Date(fromMs)),
        createdUntil: toUTCISOStringKeepingLocalDateTime(selectedDateRange.value.endDate),
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
