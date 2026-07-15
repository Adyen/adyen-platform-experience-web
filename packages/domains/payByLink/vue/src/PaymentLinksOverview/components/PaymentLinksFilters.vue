<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { endOfDay, now, quickSelectDateRanges, startOfDay, toUTCISOStringKeepingLocalDateTime } from '@integration-components/utils';
import { EARLIEST_PAYMENT_LINK_DATE_DAYS, PAYMENT_LINK_STATUSES, PAYMENT_LINK_TYPES } from '../constants';
import type { IPaymentLinkFilterStatusGroup, IPaymentLinkStatus, IPaymentLinkStatusGroup, IPaymentLinkType } from '@integration-components/types';
import type { StoreData } from '../../../../domain/src';

export interface PaymentLinksFiltersValue {
    statuses: string[];
    linkTypes: string[];
    storeIds: string[];
    merchantReference?: string;
    paymentLinkId?: string;
    createdSince: string;
    createdUntil: string;
}

const props = defineProps<{
    stores?: StoreData[];
    storeError?: Error;
    filterError?: Error;
    availableLinkTypes?: IPaymentLinkType[];
    availableStatuses?: IPaymentLinkFilterStatusGroup;
    statusGroup: IPaymentLinkStatusGroup;
    onChange?: (value: PaymentLinksFiltersValue) => void;
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

const earliestDate = startOfDay(new Date(Date.now() - EARLIEST_PAYMENT_LINK_DATE_DAYS * 24 * 60 * 60 * 1000));

function normalizeDateRange(value: BentoDateRangePickerValue): BentoDateRangePickerValue {
    if (!value?.startDate || !value?.endDate) {
        return cloneDateRange(defaultDateRange);
    }

    const startDate = startOfDay(value.startDate);
    const endDate = endOfDay(value.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return cloneDateRange(defaultDateRange);
    }

    const normalizedRange = {
        startDate,
        endDate,
        ...(value.granularity ? { granularity: value.granularity } : {}),
        ...(value.range ? { range: value.range } : {}),
    } satisfies BentoDateRangePickerValue;

    const matchingQuickSelectRange = Object.values(quickSelectDateRanges).find(range => {
        return range.startDate.getTime() === normalizedRange.startDate.getTime() && range.endDate.getTime() === normalizedRange.endDate.getTime();
    });

    return cloneDateRange(matchingQuickSelectRange ?? normalizedRange);
}

const quickSelectRanges = [
    { label: i18n.get('common.filters.types.date.rangeSelect.options.last7Days'), value: 'last7Days', data: quickSelectDateRanges.last7Days },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.last30Days'), value: 'last30Days', data: quickSelectDateRanges.last30Days },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.thisWeek'), value: 'thisWeek', data: quickSelectDateRanges.thisWeek },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.lastWeek'), value: 'lastWeek', data: quickSelectDateRanges.lastWeek },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.thisMonth'), value: 'thisMonth', data: quickSelectDateRanges.thisMonth },
    { label: i18n.get('common.filters.types.date.rangeSelect.options.lastMonth'), value: 'lastMonth', data: quickSelectDateRanges.lastMonth },
];

const defaultDateRange = cloneDateRange(quickSelectDateRanges.last30Days);

// ── Reactive filter state ──
const selectedStoreIds = ref<string[]>([]);
const selectedStatuses = ref<string[]>([]);
const selectedLinkTypes = ref<string[]>([]);
const selectedMerchantReference = ref<string | undefined>(undefined);
const selectedPaymentLinkId = ref<string | undefined>(undefined);
const selectedDateRange = ref<BentoDateRangePickerValue>(cloneDateRange(defaultDateRange));

// Reset the status filter selection whenever the active status group tab changes,
// mirroring the Preact behavior of dropping the stale status selection on tab switch.
watch(
    () => props.statusGroup,
    () => {
        selectedStatuses.value = [];
    }
);

const showStoreFilter = computed(() => (props.stores && props.stores.length > 1) || !!props.storeError);
const showLinkTypesFilter = computed(() => (props.availableLinkTypes && props.availableLinkTypes.length > 0) || !!props.filterError);
const availableStatusesForGroup = computed(() => props.availableStatuses?.[props.statusGroup]);
const showStatusFilter = computed(() => (availableStatusesForGroup.value && availableStatusesForGroup.value.length > 0) || !!props.filterError);

const filterConfig = computed<BentoFilterBarModel>(() => {
    const config: BentoFilterBarModel = [];

    if (showStoreFilter.value) {
        config.push({
            field: 'storeIds',
            label: i18n.get('payByLink.overview.filters.types.stores.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            options: {
                checkboxItems: (props.stores ?? [])
                    .filter(store => store.id)
                    .map(store => ({ label: store.storeCode ?? store.id!, value: store.id! })),
            },
        });
    }

    config.push({
        field: 'dateRange',
        label: i18n.get('common.filters.types.date.label'),
        type: BentoFilterItemType.DATE_RANGE,
        defaultValue: defaultDateRange,
        options: {
            min: earliestDate,
            max: now,
            isDateDisabled: (date: Date) => date.getTime() < earliestDate.getTime() || date.getTime() > now.getTime(),
            numberOfMonths: 1,
            quickSelectRanges,
        },
    });

    if (showLinkTypesFilter.value) {
        config.push({
            field: 'linkTypes',
            label: i18n.get('payByLink.overview.filters.types.linkTypes.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            options: {
                checkboxItems: (props.availableLinkTypes ?? []).map(type => ({ label: i18n.get(PAYMENT_LINK_TYPES[type]), value: type })),
            },
        });
    }

    if (showStatusFilter.value) {
        config.push({
            field: 'statuses',
            label: i18n.get('payByLink.overview.filters.types.status.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            options: {
                checkboxItems: (availableStatusesForGroup.value ?? []).map((status: IPaymentLinkStatus) => ({
                    label: i18n.get(PAYMENT_LINK_STATUSES[status]),
                    value: status,
                })),
            },
        });
    }

    config.push({
        field: 'merchantReference',
        label: i18n.get('payByLink.overview.filters.types.merchantReference.label'),
        type: BentoFilterItemType.INPUT,
    });

    config.push({
        field: 'paymentLinkId',
        label: i18n.get('payByLink.overview.filters.types.paymentLinkID.label'),
        type: BentoFilterItemType.INPUT,
    });

    return config;
});

const filterValues = computed<BentoFilterValues>(() => {
    const values: BentoFilterValues = [{ field: 'dateRange', value: selectedDateRange.value }];

    if (showStoreFilter.value) values.push({ field: 'storeIds', value: selectedStoreIds.value });
    if (showLinkTypesFilter.value) values.push({ field: 'linkTypes', value: selectedLinkTypes.value });
    if (showStatusFilter.value) values.push({ field: 'statuses', value: selectedStatuses.value });
    values.push({ field: 'merchantReference', value: selectedMerchantReference.value });
    values.push({ field: 'paymentLinkId', value: selectedPaymentLinkId.value });

    return values;
});

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'storeIds') {
            selectedStoreIds.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'linkTypes') {
            selectedLinkTypes.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'statuses') {
            selectedStatuses.value = (fv.value as string[]) ?? [];
        } else if (fv.field === 'merchantReference') {
            selectedMerchantReference.value = (fv.value as string) || undefined;
        } else if (fv.field === 'paymentLinkId') {
            selectedPaymentLinkId.value = (fv.value as string) || undefined;
        } else if (fv.field === 'dateRange' && fv.value) {
            selectedDateRange.value = normalizeDateRange(fv.value as BentoDateRangePickerValue);
        }
    }
}

const currentFilterValue = computed<PaymentLinksFiltersValue>(() => {
    const fromMs = Math.max(selectedDateRange.value.startDate.getTime(), earliestDate.getTime());
    return {
        statuses: selectedStatuses.value,
        linkTypes: selectedLinkTypes.value,
        storeIds: selectedStoreIds.value,
        merchantReference: selectedMerchantReference.value,
        paymentLinkId: selectedPaymentLinkId.value,
        createdSince: toUTCISOStringKeepingLocalDateTime(new Date(fromMs)),
        createdUntil: toUTCISOStringKeepingLocalDateTime(selectedDateRange.value.endDate),
    };
});

watch(currentFilterValue, value => props.onChange?.(value), { deep: true, immediate: true });
</script>

<template>
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
</template>
