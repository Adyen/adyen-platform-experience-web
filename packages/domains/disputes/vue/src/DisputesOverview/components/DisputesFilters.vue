<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccountFilterState, useDateRangeFilterState, useSortedMultiSelection } from '@integration-components/composables-vue';
import { DISPUTE_PAYMENT_SCHEMES, DISPUTE_REASON_CATEGORIES } from '@integration-components/disputes/domain';
import { createQuickSelectRanges, quickSelectDateRanges, startOfDay, uniqueId } from '@integration-components/utils';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { EARLIEST_DISPUTES_SINCE_DATE } from '../constants';

const ALL_BALANCE_ACCOUNTS_VALUE = uniqueId();

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

const schemeItems = Object.entries(DISPUTE_PAYMENT_SCHEMES).map(([value, label]) => ({ label, value }));
const reasonItems = computed(() => Object.entries(DISPUTE_REASON_CATEGORIES).map(([value, labelKey]) => ({ label: i18n.get(labelKey), value })));
const showReasonsFilter = computed(() => props.statusGroup !== 'FRAUD_ALERTS');

const { selectedBalanceAccountId, hasMultipleBalanceAccounts, balanceAccountOptions } = useBalanceAccountFilterState({
    balanceAccounts: () => props.balanceAccounts,
    preserveValue: value => value === ALL_BALANCE_ACCOUNTS_VALUE,
});

const selectedBalanceAccount = computed(
    () => props.balanceAccounts?.find(({ id }) => id === selectedBalanceAccountId.value) ?? props.balanceAccounts?.[0]
);

const { defaultDateRange, selectedDateRange, normalizeDateRange, resetDateRange, getDateRangeFilterOptions, getDateRangeQueryParams } =
    useDateRangeFilterState({
        defaultValue: quickSelectDateRanges.last90Days,
        earliestDate: startOfDay(new Date(EARLIEST_DISPUTES_SINCE_DATE)),
        timezone: () => selectedBalanceAccount.value?.timeZone,
    });

const { selectedValues: selectedSchemes, setSelectedValues: setSelectedSchemes } = useSortedMultiSelection<string>();
const { selectedValues: selectedReasons, setSelectedValues: setSelectedReasons } = useSortedMultiSelection<string>();

const filterConfig = computed<BentoFilterBarModel>(() => {
    const filters: BentoFilterBarModel = [];

    if (hasMultipleBalanceAccounts.value) {
        filters.push({
            field: 'balanceAccountId',
            label: i18n.get('common.filters.types.account.label'),
            type: BentoFilterItemType.SELECT,
            visible: !props.compact,
            ...(!props.compact ? { defaultValue: balanceAccountOptions.value[0]?.value } : {}),
            options: {
                listboxItems: [
                    ...balanceAccountOptions.value,
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
        options: { numberOfMonths: 1, ...getDateRangeFilterOptions({ quickSelectRanges }) },
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

    if (hasMultipleBalanceAccounts.value) {
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
            if (fv.value) {
                selectedDateRange.value = normalizeDateRange(fv.value as BentoDateRangePickerValue);
            } else {
                resetDateRange();
            }
        } else if (fv.field === 'schemeCodes') {
            setSelectedSchemes((fv.value as string[]) ?? []);
        } else if (fv.field === 'reasonCategories') {
            setSelectedReasons((fv.value as string[]) ?? []);
        }
    }
}

const currentFilterParams = computed(() => {
    return {
        balanceAccountId: selectedBalanceAccountId.value === ALL_BALANCE_ACCOUNTS_VALUE ? undefined : selectedBalanceAccountId.value,
        schemeCodes: selectedSchemes.value.length ? selectedSchemes.value.join(',') : undefined,
        reasonCategories: showReasonsFilter.value && selectedReasons.value.length ? selectedReasons.value.join(',') : undefined,
        ...getDateRangeQueryParams(),
    };
});

watch(currentFilterParams, params => props.onChange?.(params), { deep: true, immediate: true });
</script>

<template>
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" :show-applied-hidden-filters="false" @input="onFilterInput" />
</template>
