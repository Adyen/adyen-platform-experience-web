<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoDataGrid, BentoTag, BentoTooltipDirective as vBentoTooltip, BentoTypography } from '@adyen/bento-vue3';
import WarningFilledIcon from '@adyen/ui-assets-icons-16/vue/warning-filled';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import {
    useCustomColumnsData,
    CustomDataCell,
    useCustomColumnWidths,
    useResponsiveContainer,
    containerQueries,
    DataOverviewError,
    useTableColumns,
    useShouldHideIllustrations,
    useCondensedDataGrid,
} from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { asPageSizeItems } from '@integration-components/composables-vue/usePageLimit';
import { getDisputeDeadlineTimeRemaining, getDisputeReason, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import { DATE_FORMAT_DISPUTES, DATE_FORMAT_RESPONSE_DEADLINE, mergeRecords } from '@integration-components/utils';
import type { CustomColumn, CustomDataRetrieved, IBalanceAccountBase, OnDataRetrievedCallback } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import DisputeStatusTag from './DisputeStatusTag.vue';
import DisputePaymentMethod from './DisputePaymentMethod.vue';
import { DISPUTES_TABLE_FIELDS, EMPTY_TABLE_MESSAGE_KEYS, FIELD_KEYS, type DisputesTableFields } from '../constants';
import styles from './DisputesTable.module.scss';

const props = defineProps<{
    statusGroup: IDisputeStatusGroup;
    loading: boolean;
    error?: Error;
    data: IDisputeListItem[] | undefined;
    activeBalanceAccount?: IBalanceAccountBase;
    showPagination: boolean;
    onContactSupport?: () => void;
    onRefresh?: () => void;
    onRowClick?: (dispute: IDisputeListItem) => void;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IDisputeListItem[], CustomDataRetrieved[]>;
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: readonly number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useCoreContext();
const hideIllustrations = useShouldHideIllustrations();
const isCondensed = useCondensedDataGrid();
const config = useConfigContext();

const { dateFormat } = useTimezoneAwareDateFormatting(() => props.activeBalanceAccount?.timeZone);
const isMobile = useResponsiveContainer(containerQueries.down.xs);
const hasMultipleCurrencies = ref(true);

const {
    columns: desktopColumns,
    customFieldKeys,
    hasCustomColumn,
} = useTableColumns({
    fields: DISPUTES_TABLE_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: FIELD_KEYS,
    customColumnDefaults: () => ({ flex: 1 }),
    customColumnWidths: () => customColumnWidths.value,
    columnConfig: () => {
        const statusGroup = props.statusGroup;
        return {
            status: { visible: statusGroup === 'ONGOING_AND_CLOSED', flex: 1 },
            respondBy: { visible: statusGroup === 'CHARGEBACKS', flex: 1 },
            createdAt: { visible: true, flex: 1 },
            paymentMethod: { visible: true, flex: 1.2 },
            disputeReason: { visible: statusGroup !== 'FRAUD_ALERTS', flex: 1.5 },
            reason: { visible: statusGroup === 'FRAUD_ALERTS', flex: 2 },
            currency: { visible: hasMultipleCurrencies.value, flex: 0.7 },
            disputedAmount: { visible: statusGroup !== 'FRAUD_ALERTS', flex: 1, numeric: true },
            totalPaymentAmount: { visible: statusGroup === 'FRAUD_ALERTS', flex: 1, numeric: true },
        };
    },
    resolveStandardColumnLabel: (field, defaultLabel) =>
        field === 'disputeReason' ? i18n.get('disputes.overview.common.fields.disputeReasonLabel') : defaultLabel,
    resolveCustomColumnLabel: key => (i18n.has(key) ? i18n.get(key) : key),
});

const columns = computed<BentoColumn[]>(() => {
    if (!isMobile.value) return desktopColumns.value;

    const amountField = props.statusGroup === 'FRAUD_ALERTS' ? 'totalPaymentAmount' : 'disputedAmount';

    return [
        {
            field: 'dateAndPaymentMethod',
            label: i18n.get(props.statusGroup === 'CHARGEBACKS' ? FIELD_KEYS.respondBy : FIELD_KEYS.createdAt),
            flex: 2,
            minWidth: customColumnWidths.value.dateAndPaymentMethod,
        },
        { field: amountField, label: i18n.get(FIELD_KEYS[amountField]), flex: 1, minWidth: customColumnWidths.value[amountField], numeric: true },
    ];
});

const { customRecords, loadingCustomRecords } = useCustomColumnsData<IDisputeListItem>({
    records: () => props.data ?? [],
    hasCustomColumn: () => hasCustomColumn.value,
    onDataRetrieve: () => props.onDataRetrieve,
    mergeCustomData: ({ records, retrievedData }) =>
        mergeRecords(
            records,
            retrievedData as CustomDataRetrieved[],
            (modified, record) => modified.disputePspReference === record.disputePspReference
        ),
});

watch(
    () => [customRecords.value, loadingCustomRecords.value] as const,
    ([records, isLoadingCustomRecords]) => {
        if (isLoadingCustomRecords) {
            hasMultipleCurrencies.value = true;
            return;
        }
        hasMultipleCurrencies.value = new Set(records.map(dispute => dispute.amount.currency)).size > 1;
    },
    { immediate: true }
);

const isLoading = computed(() => props.loading || config.refreshing || loadingCustomRecords.value);

const gridData = computed<BentoDatagridDataItem[]>(() => {
    const source = customRecords.value as Array<IDisputeListItem & Record<string, any>>;
    if (!source.length) return [];
    const keys = customFieldKeys.value;
    return source.map((dispute, idx) => {
        const row: BentoDatagridDataItem = {
            id: `${dispute.disputePspReference}-${idx}`,
            _raw: dispute,
        };
        for (const key of keys) {
            row[key] = dispute[key];
        }
        return row;
    });
});

const tableRef = ref<HTMLElement | null>(null);
const customColumnWidths = useCustomColumnWidths(
    tableRef,
    () => [gridData.value, isLoading.value, isMobile.value],
    () => columns.value
);

const paginationProps = computed(() => {
    if (!props.showPagination) return undefined;
    return {
        page: props.currentPage ?? 1,
        size: props.limit ?? 10,
        hasNext: props.hasNext ?? false,
        hasPrevious: props.hasPrevious ?? false,
        pageSizeItems: asPageSizeItems(props.limitOptions),
        hidePageSize: !props.limitOptions || props.limitOptions.length <= 1,
        hideFirstLastPageButtons: true,
    };
});

const emptyStateProps = computed(() => ({
    image: hideIllustrations.value ? undefined : ('no-results-found' as const),
    variant: isMobile.value ? ('condensed' as const) : ('embedded' as const),
    title: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].title),
    description: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].message),
}));

function getDispute(item: BentoDatagridDataItem): IDisputeListItem {
    return item._raw as IDisputeListItem;
}

function formatAmount(dispute: IDisputeListItem): string {
    return i18n.amount(dispute.amount.value, dispute.amount.currency, { hideCurrency: false });
}

function getMobileDate(dispute: IDisputeListItem): string | undefined {
    return props.statusGroup === 'CHARGEBACKS' ? dispute.dueDate : dispute.createdAt;
}

function isMobileDateUrgent(dispute: IDisputeListItem): boolean {
    return props.statusGroup === 'CHARGEBACKS' && !!dispute.dueDate && isDisputeActionNeededUrgently(dispute);
}

function getTimeToDeadline(dueDate: string): string {
    if (!dueDate) return '';

    const timeRemaining = getDisputeDeadlineTimeRemaining(dueDate);
    if (!timeRemaining) return '';

    const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });
    if (timeRemaining.expired) return formattedDate;

    return timeRemaining.days <= 1
        ? i18n.get('disputes.overview.common.actionNeeded.respondToday', { values: { date: formattedDate } })
        : i18n.get('disputes.overview.common.actionNeeded.respondDays', { values: { days: timeRemaining.days, date: formattedDate } });
}

function handleNavigate(page: number) {
    if (isLoading.value) return;
    if (page > (props.currentPage ?? 1)) {
        props.goToNextPage?.();
    } else {
        props.goToPreviousPage?.();
    }
}

function handleItemsPage(size: number) {
    props.updateLimit?.(size);
}

function handleRowClick(item: BentoDatagridDataItem) {
    props.onRowClick?.(getDispute(item));
}
</script>

<template>
    <div ref="tableRef" :class="styles.root">
        <DataOverviewError
            v-if="props.error"
            :error="props.error"
            :error-message="'disputes.overview.common.errors.listUnavailable'"
            :on-contact-support="props.onContactSupport"
            :on-refresh="props.onRefresh"
            :variant="isMobile ? 'condensed' : 'embedded'"
            :refresh-icon="RefreshIcon"
        />

        <BentoDataGrid
            v-else
            :condensed="isCondensed"
            allow-row-clicks
            has-resizable-columns
            :columns="columns"
            :data="gridData"
            :loading="isLoading"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
            :allow-column-drag-and-drop="false"
            @row-click="handleRowClick"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #item-dateAndPaymentMethod="{ item }">
                <div :class="styles.mobileDetails">
                    <div
                        v-if="getMobileDate(getDispute(item))"
                        :class="[styles.mobileDate, isMobileDateUrgent(getDispute(item)) ? styles.mobileDateUrgent : '']"
                    >
                        <time :datetime="getMobileDate(getDispute(item))">
                            {{ dateFormat(getMobileDate(getDispute(item))!, DATE_FORMAT_DISPUTES) }}
                        </time>
                        <WarningFilledIcon v-if="isMobileDateUrgent(getDispute(item))" />
                    </div>
                    <DisputePaymentMethod :payment-method="getDispute(item).paymentMethod" />
                </div>
            </template>

            <template #item-status="{ item }">
                <div :class="styles.cellContent">
                    <DisputeStatusTag :dispute="getDispute(item)" />
                </div>
            </template>

            <template #item-respondBy="{ item }">
                <div :class="styles.cellContent">
                    <span
                        v-if="getDispute(item).dueDate"
                        :class="[styles.statusContent, isDisputeActionNeededUrgently(getDispute(item)) ? styles.statusContentUrgent : '']"
                    >
                        <span
                            v-if="isDisputeActionNeededUrgently(getDispute(item))"
                            v-bento-tooltip="getTimeToDeadline(getDispute(item).dueDate!)"
                            :class="styles.dateContentUrgent"
                        >
                            <time :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                            <WarningFilledIcon />
                        </span>
                        <time v-else :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                    </span>
                </div>
            </template>

            <template #item-createdAt="{ item }">
                <div :class="styles.cellContent">
                    <time :datetime="getDispute(item).createdAt" :class="styles.statusContent">
                        <BentoTypography variant="body">{{ dateFormat(getDispute(item).createdAt, DATE_FORMAT_DISPUTES) }}</BentoTypography>
                    </time>
                </div>
            </template>

            <template #item-paymentMethod="{ item }">
                <DisputePaymentMethod :payment-method="getDispute(item).paymentMethod" />
            </template>

            <template #item-disputeReason="{ item }">
                <span>{{ getDisputeReason(i18n, getDispute(item).reason?.category) }}</span>
            </template>

            <template #item-reason="{ item }">
                <span>{{ getDispute(item).reason?.title }}</span>
            </template>

            <template #item-currency="{ item }">
                <BentoTag variant="grey" :label="getDispute(item).amount.currency" />
            </template>

            <template #item-disputedAmount="{ item }">
                <BentoTypography variant="body" stronger>
                    {{ formatAmount(getDispute(item)) }}
                </BentoTypography>
            </template>

            <template #item-totalPaymentAmount="{ item }">
                <BentoTypography variant="body" stronger>
                    {{ formatAmount(getDispute(item)) }}
                </BentoTypography>
            </template>

            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" :field="key" />
            </template>
        </BentoDataGrid>
    </div>
</template>
