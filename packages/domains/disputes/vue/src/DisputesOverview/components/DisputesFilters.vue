<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { DISPUTE_PAYMENT_SCHEMES, DISPUTE_REASON_CATEGORIES } from '@integration-components/disputes/domain';
import {
    createQuickSelectRanges,
    DAY_IN_MS as DAY_MS,
    endOfDay,
    now,
    quickSelectDateRanges,
    startOfDay,
    toUTCISOStringKeepingLocalDateTime,
    uniqueId,
} from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { EARLIEST_DISPUTES_SINCE_DATE } from '../constants';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    statusGroup: IDisputeStatusGroup;
    compact?: boolean;
    onChange?: (params: {
        balanceAccountId: string | undefined;
        schemeCodes: string | undefined;
        reasonCategories: string | undefined;
        createdSince: string;
        createdUntil: string;
    }) => void;
}>();

const { i18n } = useCoreContext();

const ALL_BALANCE_ACCOUNTS_VALUE = uniqueId();
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

const quickSelectRanges = createQuickSelectRanges(
    {
        last7Days: quickSelectDateRanges.last7Days,
        last30Days: quickSelectDateRanges.last30Days,
        last90Days: last90DaysRange,
        thisWeek: quickSelectDateRanges.thisWeek,
        lastWeek: quickSelectDateRanges.lastWeek,
        thisMonth: quickSelectDateRanges.thisMonth,
        lastMonth: quickSelectDateRanges.lastMonth,
        yearToDate: quickSelectDateRanges.yearToDate,
    },
    key => i18n.get(key)
);

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
        if (
            accounts?.length &&
            selectedBalanceAccountId.value !== ALL_BALANCE_ACCOUNTS_VALUE &&
            !accounts.some(account => account.id === selectedBalanceAccountId.value)
        ) {
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
            visible: !props.compact,
            ...(!props.compact ? { defaultValue: props.balanceAccounts[0]!.id } : {}),
            options: {
                listboxItems: [
                    ...props.balanceAccounts.map(a => ({
                        label: a.description || a.id,
                        value: a.id,
                        description: a.description ? a.id : undefined,
                    })),
                    {
                        label: i18n.get('common.filters.types.account.options.all'),
                        value: ALL_BALANCE_ACCOUNTS_VALUE,
                    },
                ],
            },
        });
    }

    filters.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        visible: !props.compact,
        ...(!props.compact ? { defaultValue: defaultDateRange } : {}),
        options: { min: earliestDate, max: now, numberOfMonths: 1, quickSelectRanges },
    });

    filters.push({
        field: 'schemeCodes',
        label: i18n.get('disputes.overview.common.filters.types.paymentMethod'),
        type: BentoFilterItemType.CHECKBOX_GROUP,
        visible: !props.compact,
        options: { checkboxItems: schemeItems },
    });

    if (showReasonsFilter.value) {
        filters.push({
            field: 'reasonCategories',
            label: i18n.get('disputes.overview.common.filters.types.disputeReason'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            visible: !props.compact,
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
            selectedBalanceAccountId.value = (fv.value as string | undefined) ?? props.balanceAccounts?.[0]?.id;
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
        balanceAccountId: selectedBalanceAccountId.value === ALL_BALANCE_ACCOUNTS_VALUE ? undefined : selectedBalanceAccountId.value,
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
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" :show-applied-hidden-filters="false" @input="onFilterInput" />
</template>
