<script setup lang="ts">
import { computed } from 'vue';
import { BentoDataGrid, BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import { useCustomColumnsData } from '@integration-components/composables-vue';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import type { CustomColumn, IPayout, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { TABLE_CLASS, NET_PAYOUT_CLASS, PAYOUT_TABLE_FIELDS, type PayoutsTableFields } from '../constants';
import '../styles/PayoutsTable.scss';

const props = defineProps<{
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: Error;
    onContactSupport?: () => void;
    onRowClick?: (payout: IPayout) => void;
    showDetails?: boolean;
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

const { i18n } = useCoreContext();
// Reactive proxy — destructuring would unwrap `refreshing` into a stale snapshot.
const config = useConfigContext();

// ── Date formatting ──
function formatPayoutDate(dateStr: string): string {
    return i18n.date(dateStr, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

// ── Custom columns ──
const STANDARD_FIELDS = new Set<string>(PAYOUT_TABLE_FIELDS);

const customFieldKeys = computed<string[]>(() =>
    (props.customColumns ?? [])
        .filter(c => !!c && c.visibility !== 'hidden')
        .map(c => (typeof c?.key === 'string' ? c.key.trim() : ''))
        .filter((k): k is string => !!k && !STANDARD_FIELDS.has(k))
);

const hasCustomColumn = computed(() => customFieldKeys.value.length > 0);

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

const isLoading = computed(() => props.loading || config.refreshing || loadingCustomRecords.value);

// ── Grid columns ──
function amountLabel(key: 'fundsCapturedAmount' | 'adjustmentAmount' | 'payoutAmount'): string {
    const labelKey = `payouts.overview.list.fields.${key}` as const;
    const label = i18n.has(labelKey) ? i18n.get(labelKey) : key;
    const currency = props.data?.[0]?.[key]?.currency;
    return currency ? `${label} (${currency})` : label;
}

const columns = computed<BentoColumn[]>(() => {
    const cols: BentoColumn[] = [
        { field: 'createdAt', label: i18n.get('payouts.overview.list.fields.createdAt'), flex: 1 },
        { field: 'fundsCapturedAmount', label: amountLabel('fundsCapturedAmount'), flex: 1 },
        { field: 'adjustmentAmount', label: amountLabel('adjustmentAmount'), flex: 1 },
        { field: 'payoutAmount', label: amountLabel('payoutAmount'), flex: 1 },
    ];

    if (Array.isArray(props.customColumns)) {
        for (const column of props.customColumns) {
            if (!column || typeof column.key !== 'string') continue;
            const key = column.key.trim();
            if (!key || STANDARD_FIELDS.has(key)) continue;
            if (column.visibility === 'hidden') continue;
            const labelKey = `payouts.overview.list.fields.${key}`;
            cols.push({
                field: key,
                label: i18n.has(labelKey) ? i18n.get(labelKey) : key,
                autoWidth: true,
            });
        }
    }

    return cols;
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
    };
});

const emptyStateProps = computed(() => ({
    title: i18n.get('payouts.overview.errors.listEmpty'),
    description: i18n.get('common.errors.updateFilters'),
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

function formatAmount(value: { value: number; currency: string } | null | undefined, hideCurrency = true): string {
    if (!value) return '';
    return i18n.amount(value.value, value.currency, { hideCurrency });
}
</script>

<template>
    <div :class="TABLE_CLASS">
        <!-- Error state -->
        <div v-if="props.error" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('payouts.overview.errors.listUnavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>

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
                <BentoTypography v-if="item.payoutAmount" variant="body" :class="NET_PAYOUT_CLASS">
                    {{ formatAmount(item.payoutAmount) }}
                </BentoTypography>
            </template>
        </BentoDataGrid>
    </div>
</template>
