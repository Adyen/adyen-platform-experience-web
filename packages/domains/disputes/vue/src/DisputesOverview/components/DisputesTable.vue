<script setup lang="ts">
import { computed } from 'vue';
import { BentoDataGrid, BentoTypography, BentoTag, BentoButton, BentoTooltipDirective } from '@adyen/bento-vue3';
import WarningFilledIcon from '@adyen/ui-assets-icons-16/vue/warning-filled';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import { useCustomColumnsData, CustomDataCell, useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { getDisputeReason, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
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

const vBentoTooltip = BentoTooltipDirective;

const DAY_MS = 24 * 60 * 60 * 1000;

const { i18n } = useCoreContext();
const config = useConfigContext();

const { dateFormat } = useTimezoneAwareDateFormatting(props.activeBalanceAccount?.timeZone);
const isMobile = useResponsiveContainer(containerQueries.down.xs);

const STANDARD_FIELDS = new Set<string>(DISPUTES_TABLE_FIELDS);

const customColumnByKey = computed(() => {
    const map = new Map<string, CustomColumn<StringWithAutocompleteOptions<DisputesTableFields>>>();
    for (const column of props.customColumns ?? []) {
        if (column && typeof column.key === 'string') map.set(column.key.trim(), column);
    }
    return map;
});

const customFieldKeys = computed<string[]>(() =>
    (props.customColumns ?? [])
        .filter(c => !!c && c.visibility !== 'hidden')
        .map(c => (typeof c?.key === 'string' ? c.key.trim() : ''))
        .filter((k): k is string => !!k && !STANDARD_FIELDS.has(k))
);

const hasCustomColumn = computed(() => customFieldKeys.value.length > 0);

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

const isLoading = computed(() => props.loading || config.refreshing || loadingCustomRecords.value);

function standardColumn(field: DisputesTableFields, defaults: Partial<BentoColumn> & { visible: boolean }): BentoColumn {
    const override = customColumnByKey.value.get(field);
    const visible = override?.visibility === 'hidden' ? false : defaults.visible;
    return {
        field,
        label: i18n.get(FIELD_KEYS[field]),
        flex: 1,
        ...defaults,
        visible,
        ...(override?.flex !== undefined ? { flex: override.flex } : {}),
        ...(override?.align === 'right' ? { numeric: true } : {}),
    };
}

const columns = computed<BentoColumn[]>(() => {
    const sg = props.statusGroup;
    const mobile = isMobile.value;

    const cols: BentoColumn[] = [
        standardColumn('status', { visible: sg === 'ONGOING_AND_CLOSED' }),
        standardColumn('respondBy', { visible: sg === 'CHARGEBACKS' }),
        standardColumn('createdAt', { visible: !mobile || sg === 'FRAUD_ALERTS' }),
        standardColumn('paymentMethod', { visible: !mobile }),
        standardColumn('disputeReason', { visible: sg !== 'FRAUD_ALERTS' && !mobile }),
        standardColumn('reason', { visible: sg === 'FRAUD_ALERTS' && !mobile, flex: 2 }),
        standardColumn('currency', { visible: !mobile, flex: 0.5 }),
        standardColumn('disputedAmount', { visible: sg !== 'FRAUD_ALERTS', numeric: true }),
        standardColumn('totalPaymentAmount', { visible: sg === 'FRAUD_ALERTS', numeric: true }),
    ];

    for (const column of props.customColumns ?? []) {
        if (!column || typeof column.key !== 'string') continue;
        const key = column.key.trim();
        if (!key || STANDARD_FIELDS.has(key) || column.visibility === 'hidden') continue;
        cols.push({
            field: key,
            label: i18n.has(key) ? i18n.get(key) : key,
            autoWidth: true,
            ...(column.flex !== undefined ? { flex: column.flex } : {}),
            ...(column.align === 'right' ? { numeric: true } : {}),
        });
    }

    return cols;
});

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
    };
});

const emptyStateProps = computed(() => ({
    title: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].title),
    description: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].message),
}));

function getDispute(item: BentoDatagridDataItem): IDisputeListItem {
    return item._raw as IDisputeListItem;
}

function formatAmount(dispute: IDisputeListItem): string {
    return i18n.amount(dispute.amount.value, dispute.amount.currency, { hideCurrency: false });
}

function getTimeToDeadline(dueDate: string): string {
    const deadline = new Date(dueDate).getTime();
    const diffInDays = Math.ceil((deadline - Date.now()) / DAY_MS);
    const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });
    return diffInDays <= 1
        ? i18n.get('disputes.overview.common.actionNeeded.respondToday', { values: { date: formattedDate } })
        : i18n.get('disputes.overview.common.actionNeeded.respondDays', { values: { days: diffInDays, date: formattedDate } });
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
    <div :class="TABLE_CLASS">
        <div v-if="props.error" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('disputes.overview.common.errors.listUnavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>

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
                <div class="adyen-pe-disputes-table__cell-content" :class="{ 'adyen-pe-disputes-table__cell-content--vstack': isMobile }">
                    <DisputeStatusTag :dispute="getDispute(item)" />
                    <DisputePaymentMethod v-if="isMobile" :payment-method="getDispute(item).paymentMethod" />
                </div>
            </template>

            <template #item-respondBy="{ item }">
                <div class="adyen-pe-disputes-table__cell-content" :class="{ 'adyen-pe-disputes-table__cell-content--vstack': isMobile }">
                    <span
                        v-if="getDispute(item).dueDate"
                        class="adyen-pe-disputes-table__status-content"
                        :class="{
                            'adyen-pe-disputes-table__cell-text--grey': isMobile && !isDisputeActionNeededUrgently(getDispute(item)),
                            'adyen-pe-disputes-table__status-content--urgent': isDisputeActionNeededUrgently(getDispute(item)),
                        }"
                    >
                        <span
                            v-if="isDisputeActionNeededUrgently(getDispute(item))"
                            v-bento-tooltip="getTimeToDeadline(getDispute(item).dueDate!)"
                            class="adyen-pe-disputes-table__date-content--urgent"
                        >
                            <time :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                            <WarningFilledIcon />
                        </span>
                        <time v-else :datetime="getDispute(item).dueDate">{{ dateFormat(getDispute(item).dueDate!, DATE_FORMAT_DISPUTES) }}</time>
                    </span>
                    <DisputePaymentMethod v-if="isMobile" :payment-method="getDispute(item).paymentMethod" />
                </div>
            </template>

            <template #item-createdAt="{ item }">
                <div class="adyen-pe-disputes-table__cell-content" :class="{ 'adyen-pe-disputes-table__cell-content--vstack': isMobile }">
                    <time
                        :datetime="getDispute(item).createdAt"
                        class="adyen-pe-disputes-table__status-content"
                        :class="{ 'adyen-pe-disputes-table__cell-text--grey': isMobile }"
                    >
                        <BentoTypography variant="body">{{ dateFormat(getDispute(item).createdAt, DATE_FORMAT_DISPUTES) }}</BentoTypography>
                    </time>
                    <DisputePaymentMethod v-if="isMobile" :payment-method="getDispute(item).paymentMethod" />
                </div>
            </template>

            <template #item-paymentMethod="{ item }">
                <DisputePaymentMethod :payment-method="getDispute(item).paymentMethod" />
            </template>

            <template #item-disputeReason="{ item }">
                <span>{{ getDisputeReason(i18n, getDispute(item).reason.category) }}</span>
            </template>

            <template #item-reason="{ item }">
                <span>{{ getDispute(item).reason.title }}</span>
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
