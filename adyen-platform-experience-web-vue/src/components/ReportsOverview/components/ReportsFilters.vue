<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import type { IBalanceAccountBase } from '../types';
import { EARLIEST_PAYOUT_SINCE_DATE } from '../constants';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    onChange?: (params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) => void;
}>();

const { i18n } = useCoreContext();

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function endOfPreviousDay(date: Date): Date {
    const d = startOfDay(date);
    d.setMilliseconds(d.getMilliseconds() - 1);
    return d;
}

function cloneDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    return {
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        ...(value.granularity ? { granularity: value.granularity } : {}),
        ...(value.range ? { range: value.range } : {}),
    };
}

const now = endOfDay(new Date());
const earliestDate = startOfDay(new Date(EARLIEST_PAYOUT_SINCE_DATE));

function subDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return startOfDay(d);
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day - 1 + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
}

function startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfYear(date: Date): Date {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

const quickSelectDateRanges = {
    last7Days: {
        startDate: subDays(now, 6),
        endDate: now,
        range: 'last7Days',
    },
    last30Days: {
        startDate: subDays(now, 29),
        endDate: now,
        range: 'last30Days',
    },
    last180Days: {
        startDate: subDays(now, 179),
        endDate: now,
        range: 'last180Days',
    },
    thisWeek: {
        startDate: startOfWeek(now),
        endDate: now,
        range: 'thisWeek',
    },
    lastWeek: {
        startDate: (() => {
            const d = startOfWeek(now);
            d.setDate(d.getDate() - 7);
            return d;
        })(),
        endDate: endOfPreviousDay(startOfWeek(now)),
        range: 'lastWeek',
    },
    thisMonth: {
        startDate: startOfMonth(now),
        endDate: now,
        range: 'thisMonth',
    },
    lastMonth: {
        startDate: (() => {
            const d = startOfMonth(now);
            d.setMonth(d.getMonth() - 1);
            return d;
        })(),
        endDate: endOfPreviousDay(startOfMonth(now)),
        range: 'lastMonth',
    },
    yearToDate: {
        startDate: startOfYear(now),
        endDate: now,
        range: 'yearToDate',
    },
} satisfies Record<string, BentoDateRangePickerValue>;

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

const quickSelectRanges = [
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last7Days'),
        value: 'last7Days',
        data: quickSelectDateRanges.last7Days,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last30Days'),
        value: 'last30Days',
        data: quickSelectDateRanges.last30Days,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last180Days'),
        value: 'last180Days',
        data: quickSelectDateRanges.last180Days,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.thisWeek'),
        value: 'thisWeek',
        data: quickSelectDateRanges.thisWeek,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.lastWeek'),
        value: 'lastWeek',
        data: quickSelectDateRanges.lastWeek,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.thisMonth'),
        value: 'thisMonth',
        data: quickSelectDateRanges.thisMonth,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.lastMonth'),
        value: 'lastMonth',
        data: quickSelectDateRanges.lastMonth,
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.yearToDate'),
        value: 'yearToDate',
        data: quickSelectDateRanges.yearToDate,
    },
];

const defaultDateRange = cloneDateRange(quickSelectDateRanges.last30Days);

// ── Reactive filter state ──
const selectedBalanceAccountId = ref<string | undefined>(undefined);
const selectedDateRange = ref<BentoDateRangePickerValue>(cloneDateRange(defaultDateRange));

// Auto-select first balance account when available
watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !selectedBalanceAccountId.value) {
            selectedBalanceAccountId.value = accounts[0]!.id;
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
        createdSince: new Date(fromMs).toISOString(),
        createdUntil: selectedDateRange.value.endDate.toISOString(),
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
