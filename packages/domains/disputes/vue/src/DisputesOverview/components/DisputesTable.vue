<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    BentoCurrency,
    BentoDataGrid,
    BentoEmptyState,
    BentoList,
    BentoListItem,
    BentoLoadingIndicator,
    BentoPagination,
    BentoTag,
    BentoTooltipDirective as vBentoTooltip,
    BentoTypography,
} from '@adyen/bento-vue3';
import WarningFilledIcon from '@adyen/ui-assets-icons-16/vue/warning-filled';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { BentoDatagridDataItem } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import {
    useCustomColumnsData,
    CustomDataCell,
    useResponsiveContainer,
    containerQueries,
    DataOverviewError,
    useTableColumns,
} from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { getDisputeDeadlineTimeRemaining, getDisputeReason, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import { DATE_FORMAT_DISPUTES, DATE_FORMAT_RESPONSE_DEADLINE, mergeRecords } from '@integration-components/utils';
import type { CustomColumn, CustomDataRetrieved, IBalanceAccountBase, OnDataRetrievedCallback } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import DisputeStatusTag from './DisputeStatusTag.vue';
import DisputePaymentMethod from './DisputePaymentMethod.vue';
import { DISPUTES_TABLE_FIELDS, EMPTY_TABLE_MESSAGE_KEYS, FIELD_KEYS, TABLE_CLASS, type DisputesTableFields } from '../constants';
import '../styles/DisputesTable.scss';

const props = defineProps<{
    statusGroup: IDisputeStatusGroup;
    loading: boolean;
    error?: Error;
    data: IDisputeListItem[] | undefined;
    activeBalanceAccount?: IBalanceAccountBase;
    showPagination: boolean;
    onContactSupport?: () => void;
    onRowClick?: (dispute: IDisputeListItem) => void;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IDisputeListItem[], CustomDataRetrieved[]>;
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();

const { dateFormat } = useTimezoneAwareDateFormatting(() => props.activeBalanceAccount?.timeZone);
const isMobile = useResponsiveContainer(containerQueries.down.xs);
const hasMultipleCurrencies = ref(true);

const { columns, customFieldKeys, hasCustomColumn } = useTableColumns({
    fields: DISPUTES_TABLE_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: FIELD_KEYS,
    customColumnDefaults: () => ({ flex: 1, minWidth: 0 }),
    columnConfig: () => {
        const statusGroup = props.statusGroup;
        return {
            status: { visible: statusGroup === 'ONGOING_AND_CLOSED', flex: 1, minWidth: 130 },
            respondBy: { visible: statusGroup === 'CHARGEBACKS', flex: 1, minWidth: 120 },
            createdAt: { visible: true, flex: 1, minWidth: 120 },
            paymentMethod: { visible: true, flex: 1.2, minWidth: 150 },
            disputeReason: { visible: statusGroup !== 'FRAUD_ALERTS', flex: 1.5, minWidth: 180 },
            reason: { visible: statusGroup === 'FRAUD_ALERTS', flex: 2, minWidth: 220 },
            currency: { visible: hasMultipleCurrencies.value, flex: 0.7, minWidth: 90 },
            disputedAmount: { visible: statusGroup !== 'FRAUD_ALERTS', flex: 1, minWidth: 140, numeric: true },
            totalPaymentAmount: { visible: statusGroup === 'FRAUD_ALERTS', flex: 1, minWidth: 140, numeric: true },
        };
    },
    resolveStandardColumnLabel: (field, defaultLabel) =>
        field === 'disputeReason' ? i18n.get('disputes.overview.common.fields.disputeReasonLabel') : defaultLabel,
    resolveCustomColumnLabel: key => (i18n.has(key) ? i18n.get(key) : key),
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
const showMobilePagination = computed(() => props.showPagination && (props.hasNext || props.hasPrevious));

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

const paginationProps = computed(() => {
    if (!props.showPagination) return undefined;
    return {
        page: props.currentPage ?? 1,
        size: props.limit ?? 10,
        hasNext: props.hasNext ?? false,
        hasPrevious: props.hasPrevious ?? false,
        hidePageSize: !props.limitOptions || props.limitOptions.length <= 1,
        hideFirstLastPageButtons: true,
    };
});

const emptyStateProps = computed(() => ({
    image: 'no-results-found' as const,
    variant: 'embedded' as const,
    title: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].title),
    description: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].message),
}));

function getDispute(item: BentoDatagridDataItem): IDisputeListItem {
    return item._raw as IDisputeListItem;
}

function formatAmount(dispute: IDisputeListItem): string {
    return i18n.amount(dispute.amount.value, dispute.amount.currency, { hideCurrency: false });
}

function getMobileDate(dispute: IDisputeListItem): string {
    return props.statusGroup === 'CHARGEBACKS' && dispute.dueDate ? dispute.dueDate : dispute.createdAt;
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

function handleListItemClick(dispute: IDisputeListItem) {
    props.onRowClick?.(dispute);
}
</script>

<template>
    <div :class="TABLE_CLASS">
        <DataOverviewError
            v-if="props.error"
            :error="props.error"
            :error-message="'disputes.overview.common.errors.listUnavailable'"
            :on-contact-support="props.onContactSupport"
            :variant="isMobile ? 'condensed' : 'embedded'"
            :refresh-icon="RefreshIcon"
            :copy-icon="CopyIcon"
        />

        <template v-else-if="isMobile">
            <div v-if="isLoading" class="adyen-pe-disputes-table__loading" aria-busy="true">
                <BentoLoadingIndicator />
            </div>

            <BentoEmptyState
                v-else-if="!customRecords.length"
                variant="condensed"
                :image="emptyStateProps.image"
                :title="emptyStateProps.title"
                :description="emptyStateProps.description"
            />

            <template v-else>
                <BentoList>
                    <BentoListItem
                        v-for="dispute in customRecords"
                        :key="dispute.disputePspReference"
                        with-chevron
                        show-bottom-divider
                        @click="handleListItemClick(dispute)"
                    >
                        <template #content>
                            <div class="adyen-pe-disputes-table__mobile-row">
                                <div class="adyen-pe-disputes-table__mobile-details">
                                    <div
                                        class="adyen-pe-disputes-table__mobile-date"
                                        :class="{ 'adyen-pe-disputes-table__mobile-date--urgent': isMobileDateUrgent(dispute) }"
                                    >
                                        <time :datetime="getMobileDate(dispute)">
                                            {{ dateFormat(getMobileDate(dispute), DATE_FORMAT_DISPUTES) }}
                                        </time>
                                        <WarningFilledIcon v-if="isMobileDateUrgent(dispute)" />
                                    </div>
                                    <DisputePaymentMethod :payment-method="dispute.paymentMethod" />
                                </div>
                                <BentoTypography class="adyen-pe-disputes-table__mobile-amount" variant="body" stronger>
                                    <BentoCurrency :currency="dispute.amount.currency" :value="dispute.amount.value" :disable-typography="true" />
                                </BentoTypography>
                            </div>
                        </template>
                    </BentoListItem>
                </BentoList>

                <BentoPagination
                    hide-first-last-page-buttons
                    v-if="showMobilePagination"
                    :page="props.currentPage"
                    :size="props.limit"
                    :has-next="props.hasNext"
                    hide-page-size
                    @navigate="handleNavigate"
                />
            </template>
        </template>

        <BentoDataGrid
            v-else
            :columns="columns"
            :data="gridData"
            :loading="isLoading"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
            :has-resizable-columns="false"
            :allow-column-drag-and-drop="false"
            :allow-row-clicks="true"
            @row-click="handleRowClick"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #item-status="{ item }">
                <div class="adyen-pe-disputes-table__cell-content">
                    <DisputeStatusTag :dispute="getDispute(item)" />
                </div>
            </template>

            <template #item-respondBy="{ item }">
                <div class="adyen-pe-disputes-table__cell-content">
                    <span
                        v-if="getDispute(item).dueDate"
                        class="adyen-pe-disputes-table__status-content"
                        :class="{
                            'adyen-pe-disputes-table__status-content--urgent': isDisputeActionNeededUrgently(getDispute(item)),
                        }"
                    >
                        <span
                            v-if="isDisputeActionNeededUrgently(getDispute(item))"
                            class="adyen-pe-disputes-table__date-content--urgent"
                            data-testid="urgent-dispute-deadline"
                            v-bento-tooltip="getTimeToDeadline(getDispute(item).dueDate!)"
                        >
                            <time :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                            <WarningFilledIcon />
                        </span>
                        <time v-else :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                    </span>
                </div>
            </template>

            <template #item-createdAt="{ item }">
                <div class="adyen-pe-disputes-table__cell-content">
                    <time :datetime="getDispute(item).createdAt" class="adyen-pe-disputes-table__status-content">
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
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
