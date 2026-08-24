<script setup lang="ts">
import { computed } from 'vue';
import {
    BentoCurrency,
    BentoDataGrid,
    BentoEmptyState,
    BentoList,
    BentoListItem,
    BentoLoadingIndicator,
    BentoPagination,
    BentoTag,
    BentoTooltipDirective,
    BentoTypography,
} from '@adyen/bento-vue3';
import WarningFilledIcon from '@adyen/ui-assets-icons-16/vue/warning-filled';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { BentoColumn, BentoCurrencyISOCode, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import {
    useCustomColumnsData,
    CustomDataCell,
    useResponsiveContainer,
    containerQueries,
    DataOverviewError,
    useShouldHideIllustrations,
} from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { getDisputeReason, isDisputeActionNeededUrgently } from '@integration-components/disputes/domain';
import { DATE_FORMAT_DISPUTES, DATE_FORMAT_RESPONSE_DEADLINE, DAY_IN_MS as DAY_MS, mergeRecords } from '@integration-components/utils';
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

const { i18n } = useCoreContext();
const hideIllustrations = useShouldHideIllustrations();
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
const hasMultipleCurrencies = computed(() => new Set(customRecords.value.map(dispute => dispute.amount.currency)).size > 1);
const showMobilePagination = computed(() => props.showPagination && (props.hasNext || props.hasPrevious));

function standardColumn(field: DisputesTableFields, defaults: Partial<BentoColumn> & { visible: boolean }): BentoColumn {
    const override = customColumnByKey.value.get(field);
    const visible = override?.visibility === 'hidden' ? false : defaults.visible;
    const column: BentoColumn = {
        field,
        label: i18n.get(field === 'disputeReason' ? 'disputes.overview.common.fields.disputeReasonLabel' : FIELD_KEYS[field]),
        ...defaults,
        visible,
        ...(override?.flex !== undefined ? { flex: override.flex } : {}),
        ...(override?.align === 'right' ? { numeric: true } : {}),
    };
    if (column.flex === undefined) column.autoWidth = true;
    return column;
}

const columns = computed<BentoColumn[]>(() => {
    const sg = props.statusGroup;

    const cols: BentoColumn[] = [
        standardColumn('status', { visible: sg === 'ONGOING_AND_CLOSED', flex: 1, minWidth: 130 }),
        standardColumn('respondBy', { visible: sg === 'CHARGEBACKS', flex: 1, minWidth: 120 }),
        standardColumn('createdAt', { visible: true, flex: 1, minWidth: 120 }),
        standardColumn('paymentMethod', { visible: true, flex: 1.2, minWidth: 150 }),
        standardColumn('disputeReason', { visible: sg !== 'FRAUD_ALERTS', flex: 1.5, minWidth: 180 }),
        standardColumn('reason', { visible: sg === 'FRAUD_ALERTS', flex: 2, minWidth: 220 }),
        standardColumn('currency', { visible: hasMultipleCurrencies.value, flex: 0.7, minWidth: 90 }),
        standardColumn('disputedAmount', { visible: sg !== 'FRAUD_ALERTS', flex: 1, minWidth: 140, numeric: true }),
        standardColumn('totalPaymentAmount', { visible: sg === 'FRAUD_ALERTS', flex: 1, minWidth: 140, numeric: true }),
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
        hideFirstLastPageButtons: true,
    };
});

const emptyStateProps = computed(() => ({
    image: hideIllustrations.value ? undefined : ('no-results-found' as const),
    variant: 'embedded' as const,
    title: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].title),
    description: i18n.get(EMPTY_TABLE_MESSAGE_KEYS[props.statusGroup].message),
}));

function getDispute(item: BentoDatagridDataItem): IDisputeListItem {
    return item._raw as IDisputeListItem;
}

function formatNumericAmount(dispute: IDisputeListItem): string {
    return i18n.amount(dispute.amount.value, dispute.amount.currency, { hideCurrency: true });
}

function getMobileDate(dispute: IDisputeListItem): string {
    return props.statusGroup === 'CHARGEBACKS' && dispute.dueDate ? dispute.dueDate : dispute.createdAt;
}

function isMobileDateUrgent(dispute: IDisputeListItem): boolean {
    return props.statusGroup === 'CHARGEBACKS' && !!dispute.dueDate && isDisputeActionNeededUrgently(dispute);
}

function getTimeToDeadline(dueDate: string): string {
    const deadline = new Date(dueDate).getTime();
    const diffInDays = Math.ceil((deadline - Date.now()) / DAY_MS);
    const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });
    if (diffInDays < 0) {
        return formattedDate;
    }
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

function handleListItemClick(dispute: IDisputeListItem) {
    props.onRowClick?.(dispute);
}
</script>

<template>
    <div :class="styles.root">
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
            <div v-if="isLoading" :class="styles.loading" aria-busy="true">
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
                        show-bottom-divider
                        @click="handleListItemClick(dispute)"
                    >
                        <template #content>
                            <div :class="styles.mobileRow">
                                <div :class="styles.mobileDetails">
                                    <div
                                        :class="[
                                            styles.mobileDate,
                                            {
                                                [styles.mobileDateUrgent]: isMobileDateUrgent(dispute),
                                            },
                                        ]"
                                    >
                                        <time :datetime="getMobileDate(dispute)">
                                            {{ dateFormat(getMobileDate(dispute), DATE_FORMAT_DISPUTES) }}
                                        </time>
                                        <WarningFilledIcon v-if="isMobileDateUrgent(dispute)" />
                                    </div>
                                    <DisputePaymentMethod :payment-method="dispute.paymentMethod" />
                                </div>
                                <BentoTypography :class="styles.mobileAmount" variant="body" stronger>
                                    <BentoCurrency
                                        :currency="dispute.amount.currency as BentoCurrencyISOCode"
                                        :value="dispute.amount.value"
                                        :disable-typography="true"
                                    />
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
                <div :class="styles.cellContent">
                    <DisputeStatusTag :dispute="getDispute(item)" />
                </div>
            </template>

            <template #item-respondBy="{ item }">
                <div :class="styles.cellContent">
                    <span
                        v-if="getDispute(item).dueDate"
                        :class="[
                            styles.statusContent,
                            {
                                [styles.statusContentUrgent]: isDisputeActionNeededUrgently(getDispute(item)),
                            },
                        ]"
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
                    <BentoCurrency
                        v-if="!hasMultipleCurrencies"
                        :currency="getDispute(item).amount.currency"
                        :value="getDispute(item).amount.value"
                        :disable-typography="true"
                    />
                    <template v-else>{{ formatNumericAmount(getDispute(item)) }}</template>
                </BentoTypography>
            </template>

            <template #item-totalPaymentAmount="{ item }">
                <BentoTypography variant="body" stronger>
                    <BentoCurrency
                        v-if="!hasMultipleCurrencies"
                        :currency="getDispute(item).amount.currency"
                        :value="getDispute(item).amount.value"
                        :disable-typography="true"
                    />
                    <template v-else>{{ formatNumericAmount(getDispute(item)) }}</template>
                </BentoTypography>
            </template>

            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
