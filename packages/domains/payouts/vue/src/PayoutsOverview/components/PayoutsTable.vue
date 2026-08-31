<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoDataGrid, BentoTypography } from '@adyen/bento-vue3';
import {
    useCustomColumnsData,
    CustomDataCell,
    DataOverviewError,
    useTableColumns,
    type DataOverviewErrorPresentation,
} from '@integration-components/composables-vue';
import { useContainerQuery } from '@integration-components/composables-vue/useContainerQuery';
import { containerQueries } from '@integration-components/composables-vue/containerQueries';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import type { CustomColumn, IPayout, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { PAYOUT_TABLE_FIELDS, type PayoutsTableFields } from '../constants';
import { DATE_FORMAT_PAYOUTS, DATE_FORMAT_PAYOUTS_MOBILE } from '@integration-components/utils';
import styles from './PayoutsTable.module.scss';
import { usePayoutsContext } from '../../integration/context';

const props = defineProps<{
    loading: boolean;
    errorPresentation?: DataOverviewErrorPresentation;
    onRowClick?: (payout: IPayout) => void;
    showPagination: boolean;
    data: IPayout[] | undefined;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<PayoutsTableFields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IPayout[], CustomDataRetrieved[]>;
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n, runtime } = usePayoutsContext();

// ── Date formatting ──
const containerRef = ref<HTMLElement | null>(null);
const isMobile = useContainerQuery(containerQueries.down.xs, containerRef);
const mobileColumns = new Set(['createdAt', 'payoutAmount']);

function formatPayoutDate(dateStr: string): string {
    return i18n.date(dateStr, { timeZone: 'UTC', ...(isMobile.value ? DATE_FORMAT_PAYOUTS_MOBILE : DATE_FORMAT_PAYOUTS) });
}

// ── Custom columns ──
const {
    columns: configuredColumns,
    customFieldKeys,
    hasCustomColumn,
} = useTableColumns({
    fields: PAYOUT_TABLE_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: {
        createdAt: 'payouts.overview.list.fields.createdAt',
        fundsCapturedAmount: 'payouts.overview.list.fields.fundsCapturedAmount',
        adjustmentAmount: 'payouts.overview.list.fields.adjustmentAmount',
        payoutAmount: 'payouts.overview.list.fields.payoutAmount',
    },
    translate: key => i18n.get(key),
    columnConfig: () => ({
        createdAt: { flex: 1 },
        fundsCapturedAmount: { flex: 1, numeric: true },
        adjustmentAmount: { flex: 1, numeric: true },
        payoutAmount: { flex: 1, numeric: true },
    }),
    customColumnDefaults: () => ({ flex: 1 }),
    resolveCustomColumnLabel: key => {
        const labelKey = `payouts.overview.list.fields.${key}`;
        return i18n.has(key) ? i18n.get(key) : i18n.has(labelKey) ? i18n.get(labelKey) : key;
    },
});

const { customRecords, loadingCustomRecords } = useCustomColumnsData<IPayout>({
    records: () => props.data ?? [],
    hasCustomColumn: () => hasCustomColumn.value,
    onDataRetrieve: () => props.onDataRetrieve,
    mergeCustomData: ({ records, retrievedData }) =>
        records.map(record => {
            const match = (retrievedData as CustomDataRetrieved[]).find(m => m.createdAt === record.createdAt);
            return match ? ({ ...record, ...match } as IPayout & Record<string, any>) : record;
        }),
});

const isLoading = computed(() => props.loading || runtime.refreshing || loadingCustomRecords.value);

const columns = computed<BentoColumn[]>(() => {
    return isMobile.value ? configuredColumns.value.filter(column => mobileColumns.has(column.field)) : configuredColumns.value;
});

// ── Grid data ──
const gridData = computed<BentoDatagridDataItem[]>(() => {
    const source = customRecords.value as Array<IPayout & Record<string, any>>;
    if (!source.length) return [];
    const keys = customFieldKeys.value;
    return source.map((payout, idx) => {
        const row: BentoDatagridDataItem = {
            id: `${payout.createdAt}-${idx}`,
            createdAt: payout.createdAt ?? '',
            fundsCapturedAmount: payout.fundsCapturedAmount ?? null,
            adjustmentAmount: payout.adjustmentAmount ?? null,
            payoutAmount: payout.payoutAmount ?? null,
            _raw: payout,
        };
        for (const key of keys) {
            row[key] = payout[key];
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
    title: i18n.get('payouts.overview.errors.listEmpty'),
    description: i18n.get('payouts.errors.updateFilters'),
}));

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
    props.onRowClick?.(item._raw as IPayout);
}

function formatAmount(value: { value: number; currency: string } | null | undefined): string {
    if (!value) return '';
    return i18n.amount(value.value, value.currency, { hideCurrency: false });
}
</script>

<template>
    <div ref="containerRef" :class="styles.root">
        <!-- Error state -->
        <DataOverviewError v-if="props.errorPresentation" v-bind="props.errorPresentation" />

        <BentoDataGrid
            v-else
            outline
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
            <template #item-createdAt="{ item }">
                <time v-if="item.createdAt" :datetime="item.createdAt">
                    <BentoTypography variant="body">
                        {{ formatPayoutDate(item.createdAt) }}
                    </BentoTypography>
                </time>
            </template>
            <template #item-fundsCapturedAmount="{ item }">
                <BentoTypography v-if="item.fundsCapturedAmount" variant="body">
                    {{ formatAmount(item.fundsCapturedAmount) }}
                </BentoTypography>
            </template>
            <template #item-adjustmentAmount="{ item }">
                <BentoTypography v-if="item.adjustmentAmount" variant="body">
                    {{ formatAmount(item.adjustmentAmount) }}
                </BentoTypography>
            </template>
            <template #item-payoutAmount="{ item }">
                <BentoTypography v-if="item.payoutAmount" variant="body" :stronger="isMobile">
                    {{ formatAmount(item.payoutAmount) }}
                </BentoTypography>
            </template>
            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
