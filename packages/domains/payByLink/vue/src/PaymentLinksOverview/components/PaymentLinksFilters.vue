<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { BentoFilterBar, BentoFilterItemType } from '@adyen/bento-vue3';
import type { BentoFilterBarModel, BentoFilterValues, BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useDateRangeFilterState, useSortedMultiSelection } from '@integration-components/composables-vue';
import { createQuickSelectRanges, DAY_IN_MS, quickSelectDateRanges, startOfDay } from '@integration-components/utils';
import { EARLIEST_PAYMENT_LINK_DATE_DAYS } from '../constants';
import type { IPaymentLinkFilterStatusGroup, IPaymentLinkStatus, IPaymentLinkStatusGroup, IPaymentLinkType } from '@integration-components/types';
import type { StoreData } from '../../../../domain/src';
import { usePaymentLinkLabels } from '../composables/usePaymentLinkLabels';

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
const { getStatusLabel, getLinkTypeLabel } = usePaymentLinkLabels();
const earliestDate = startOfDay(new Date(Date.now() - EARLIEST_PAYMENT_LINK_DATE_DAYS * DAY_IN_MS));

const quickSelectRanges = createQuickSelectRanges(
    {
        last7Days: quickSelectDateRanges.last7Days,
        last30Days: quickSelectDateRanges.last30Days,
        thisWeek: quickSelectDateRanges.thisWeek,
        lastWeek: quickSelectDateRanges.lastWeek,
        thisMonth: quickSelectDateRanges.thisMonth,
        lastMonth: quickSelectDateRanges.lastMonth,
    },
    key => i18n.get(key)
);

const { defaultDateRange, selectedDateRange, normalizeDateRange, getDateRangeFilterOptions, getDateRangeQueryParams } = useDateRangeFilterState({
    defaultValue: quickSelectDateRanges.last30Days,
    earliestDate,
});

const { selectedValues: selectedStoreIds, setSelectedValues: setSelectedStoreIds } = useSortedMultiSelection<string>();
const { selectedValues: selectedStatuses, setSelectedValues: setSelectedStatuses } = useSortedMultiSelection<string>();
const { selectedValues: selectedLinkTypes, setSelectedValues: setSelectedLinkTypes } = useSortedMultiSelection<string>();
const selectedMerchantReference = ref<string | undefined>(undefined);
const selectedPaymentLinkId = ref<string | undefined>(undefined);

// Reset the status filter selection whenever the active status group tab changes,
// mirroring the Preact behavior of dropping the stale status selection on tab switch.
watch(
    () => props.statusGroup,
    () => setSelectedStatuses()
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
            defaultValue: [],
            disabled: !!props.storeError,
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
            numberOfMonths: 1,
            ...getDateRangeFilterOptions({ quickSelectRanges, disableUnavailableDates: true }),
        },
    });

    if (showLinkTypesFilter.value) {
        config.push({
            field: 'linkTypes',
            label: i18n.get('payByLink.overview.filters.types.linkTypes.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            disabled: !!props.filterError,
            options: {
                checkboxItems: (props.availableLinkTypes ?? []).map(type => ({ label: getLinkTypeLabel(type), value: type })),
            },
        });
    }

    if (showStatusFilter.value) {
        config.push({
            field: 'statuses',
            label: i18n.get('payByLink.overview.filters.types.status.label'),
            type: BentoFilterItemType.CHECKBOX_GROUP,
            disabled: !!props.filterError,
            options: {
                checkboxItems: (availableStatusesForGroup.value ?? []).map((status: IPaymentLinkStatus) => ({
                    label: getStatusLabel(status),
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

function getFilterValue(field: string) {
    switch (field) {
        case 'storeIds':
            return selectedStoreIds.value;
        case 'dateRange':
            return selectedDateRange.value;
        case 'linkTypes':
            return selectedLinkTypes.value;
        case 'statuses':
            return selectedStatuses.value;
        case 'merchantReference':
            return selectedMerchantReference.value;
        case 'paymentLinkId':
            return selectedPaymentLinkId.value;
    }
}

const filterValues = computed<BentoFilterValues>(() => {
    return filterConfig.value.map(({ field }) => ({
        field,
        value: getFilterValue(field),
    }));
});

function onFilterInput(updatedValues: BentoFilterValues) {
    for (const fv of updatedValues) {
        if (fv.field === 'storeIds') {
            setSelectedStoreIds((fv.value as string[]) ?? []);
        } else if (fv.field === 'linkTypes') {
            setSelectedLinkTypes((fv.value as string[]) ?? []);
        } else if (fv.field === 'statuses') {
            setSelectedStatuses((fv.value as string[]) ?? []);
        } else if (fv.field === 'merchantReference') {
            selectedMerchantReference.value = (fv.value as string) || undefined;
        } else if (fv.field === 'paymentLinkId') {
            selectedPaymentLinkId.value = (fv.value as string) || undefined;
        } else if (fv.field === 'dateRange' && fv.value) {
            selectedDateRange.value = normalizeDateRange(fv.value as BentoDateRangePickerValue);
        }
    }
}

const currentFilterParams = computed<PaymentLinksFiltersValue>(() => {
    return {
        statuses: selectedStatuses.value,
        linkTypes: selectedLinkTypes.value,
        storeIds: selectedStoreIds.value,
        merchantReference: selectedMerchantReference.value,
        paymentLinkId: selectedPaymentLinkId.value,
        ...getDateRangeQueryParams(),
    };
});

watch(currentFilterParams, params => props.onChange?.(params), { deep: true, immediate: true });
</script>

<template>
    <BentoFilterBar :config="filterConfig" :filter-values="filterValues" @input="onFilterInput" />
</template>
