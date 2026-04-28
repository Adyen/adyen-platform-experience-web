<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { BentoDataGrid, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import { useCustomColumnsData } from '@integration-components/composables-vue';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import type { BentoColumn, BentoDatagridDataItem, BentoDataGridRowActionsProp } from '@adyen/bento-vue3';
import type { CustomColumn, IReport, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { TABLE_CLASS, DISABLED_BUTTONS_TIMEOUT } from '../constants';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import '../styles/ReportsTable.scss';

export const FIELDS = ['createdAt', 'dateAndReportType', 'reportType', 'reportFile'] as const;
export type ReportsTableFields = (typeof FIELDS)[number];

const props = defineProps<{
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: Error;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IReport[] | undefined;
    customColumns?: CustomColumn<StringWithAutocompleteOptions<ReportsTableFields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IReport[]>;
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
// Keep the reactive proxy here — destructuring `useConfigContext()` would unwrap
// the `refreshing` primitive into a one-time snapshot and capture a stale
// `endpoints` reference, breaking reactivity when the session is refreshed.
const config = useConfigContext();

// ── Download freeze logic ──
const frozen = ref(false);
let freezeTimeoutId: ReturnType<typeof setTimeout> | undefined;

function freeze() {
    if (frozen.value) return;
    frozen.value = true;
    freezeTimeoutId = setTimeout(() => {
        frozen.value = false;
    }, DISABLED_BUTTONS_TIMEOUT);
}

onUnmounted(() => {
    if (freezeTimeoutId) {
        clearTimeout(freezeTimeoutId);
        freezeTimeoutId = undefined;
    }
});

// ── Download error alert ──
const alert = ref<{ title: string; description: string } | null>(null);

function removeAlert() {
    alert.value = null;
}

function onDownloadErrorAlert(error?: AdyenPlatformExperienceError) {
    const errorCode = error?.errorCode;
    if (errorCode === '999_429_001') {
        alert.value = {
            title: i18n.get('reports.overview.errors.download'),
            description: i18n.get('reports.overview.errors.tooManyDownloads'),
        };
    } else {
        alert.value = {
            title: i18n.get('reports.overview.errors.download'),
            description: i18n.get('reports.overview.errors.retryDownload'),
        };
    }
}

// ── Date formatting ──
function formatReportDate(dateStr: string): string {
    return i18n.date(dateStr, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

function getReportType(type: string): string {
    const key = `reports.common.types.${type}`;
    return i18n.has(key) ? i18n.get(key) : type;
}

// ── Download handler ──
async function handleDownload(item: IReport) {
    const downloadReport = config.endpoints.downloadReport;
    if (typeof downloadReport !== 'function') return;

    freeze();
    alert.value = null;

    try {
        const result = await downloadReport(
            {},
            {
                query: {
                    balanceAccountId: props.balanceAccountId ?? '',
                    createdAt: item.createdAt ?? '',
                    type: item.type ?? '',
                },
            }
        );
        if (result?.blob) {
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename || 'report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (e) {
        onDownloadErrorAlert(e as AdyenPlatformExperienceError);
    }
}

// ── Custom columns ──
const STANDARD_FIELDS = new Set<string>(FIELDS);

const customFieldKeys = computed<string[]>(() =>
    (props.customColumns ?? [])
        .filter(c => !!c && c.visibility !== 'hidden')
        .map(c => (typeof c?.key === 'string' ? c.key.trim() : ''))
        .filter((k): k is string => !!k && !STANDARD_FIELDS.has(k))
);

const hasCustomColumn = computed(() => customFieldKeys.value.length > 0);

const { customRecords, loadingCustomRecords } = useCustomColumnsData<IReport>({
    records: () => props.data ?? [],
    hasCustomColumn: () => hasCustomColumn.value,
    onDataRetrieve: () => props.onDataRetrieve,
    mergeCustomData: ({ records, retrievedData }) =>
        records.map(record => {
            const match = (retrievedData as CustomDataRetrieved[]).find(m => m.createdAt === record.createdAt);
            // Custom data layers on top of the original record so consumer-supplied
            // custom fields (the whole point of `onDataRetrieve`) are not silently
            // overwritten by the original record.
            return match ? ({ ...record, ...match } as IReport & Record<string, any>) : record;
        }),
});

// ── Grid columns ──
const isLoading = computed(() => props.loading || config.refreshing || loadingCustomRecords.value);

const columns = computed<BentoColumn[]>(() => {
    const cols: BentoColumn[] = [
        { field: 'createdAt', label: i18n.get('reports.overview.list.fields.createdAt'), autoWidth: true },
        { field: 'reportType', label: i18n.get('reports.overview.list.fields.reportType'), autoWidth: true },
    ];

    if (Array.isArray(props.customColumns)) {
        for (const column of props.customColumns) {
            if (!column || typeof column.key !== 'string') continue;
            const key = column.key.trim();
            if (!key || STANDARD_FIELDS.has(key)) continue;
            if (column.visibility === 'hidden') continue;
            const labelKey = `reports.overview.list.fields.${key}`;
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
    const source = customRecords.value as Array<IReport & Record<string, any>>;
    if (!source.length) return [];
    const keys = customFieldKeys.value;
    return source.map((report, idx) => {
        const row: BentoDatagridDataItem = {
            id: `${report.createdAt}-${idx}`,
            createdAt: formatReportDate(report.createdAt ?? ''),
            reportType: getReportType(report.type ?? ''),
            _raw: report,
        };
        for (const key of keys) {
            row[key] = report[key];
        }
        return row;
    });
});

// ── Row actions ──
const getRowActions: BentoDataGridRowActionsProp = (item: BentoDatagridDataItem) => [
    {
        title: i18n.get('reports.overview.list.controls.downloadReport.label'),
        event: () => handleDownload(item._raw as IReport),
        tooltipText: i18n.get('reports.overview.list.controls.downloadReport.label'),
        disabled: frozen.value,
        iconLeft: DownloadIcon,
    },
];

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
    title: i18n.get('reports.overview.errors.listEmpty'),
    description: i18n.get('common.errors.updateFilters'),
}));

function handleNavigate(page: number) {
    if (page > (props.currentPage ?? 1)) {
        props.goToNextPage?.();
    } else {
        props.goToPreviousPage?.();
    }
}

function handleItemsPage(size: number) {
    props.updateLimit?.(size);
}

// Clear alert whenever a new fetch begins. This must be a watcher; a top-level
// `if (props.loading) ...` would only run once during component setup.
watch(
    () => props.loading,
    loading => {
        if (loading) alert.value = null;
    },
    { immediate: true }
);
</script>

<template>
    <div :class="TABLE_CLASS">
        <!-- Download error alert -->
        <div v-if="alert" class="adyen-pe-reports-table-alert" role="alert">
            <div>
                <strong>{{ alert.title }}</strong>
                <p>{{ alert.description }}</p>
            </div>
            <BentoButton variant="tertiary" size="small" @click="removeAlert">&times;</BentoButton>
        </div>

        <!-- Error state -->
        <div v-if="props.error" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('reports.overview.errors.listUnavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport') }}
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
            :row-actions="getRowActions"
            :has-resizable-columns="false"
            :allow-column-drag-and-drop="false"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #item-createdAt="{ item }">
                <time :datetime="item.createdAt">
                    {{ formatReportDate(item.createdAt) }}
                </time>
            </template>
            <template #item-reportType="{ item }">
                {{ getReportType(item.reportType) }}
            </template>
        </BentoDataGrid>
    </div>
</template>
