<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { BentoButton, BentoDataGrid, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import {
    useCustomColumnsData,
    useTableColumns,
    CustomDataCell,
    useResponsiveContainer,
    containerQueries,
    DataOverviewError,
} from '@integration-components/composables-vue';
import { DATE_FORMAT_REPORTS } from '@integration-components/utils';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { BentoDatagridDataItem, BentoDataGridRowActionsProp } from '@adyen/bento-vue3';
import type { CustomColumn, IReport, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { getReportType, REPORTS_DOWNLOAD_DISABLED_TIMEOUT, REPORTS_TABLE_FIELDS } from '../../../../domain/src';
import styles from './ReportsTable.module.scss';

export type ReportsTableFields = (typeof REPORTS_TABLE_FIELDS)[number];

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
    }, REPORTS_DOWNLOAD_DISABLED_TIMEOUT);
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

// ── Responsive ──
const isMobile = useResponsiveContainer(containerQueries.down.sm);

// ── Custom columns ──
const {
    columns: desktopColumns,
    customFieldKeys,
    hasCustomColumn,
} = useTableColumns({
    fields: REPORTS_TABLE_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: {
        createdAt: 'reports.overview.list.fields.createdAt',
        reportType: 'reports.overview.list.fields.reportType',
    },
    resolveCustomColumnLabel: key => {
        const labelKey = `reports.overview.list.fields.${key}` as any;
        return i18n.has(labelKey) ? i18n.get(labelKey) : i18n.get(key as TranslationKey);
    },
});

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
const columns = computed(() => {
    if (isMobile.value) {
        return [{ field: 'dateAndReportType', label: i18n.get('reports.overview.list.fields.reportType'), autoWidth: true }];
    }
    return desktopColumns.value;
});

const isLoading = computed(() => props.loading || config.refreshing || loadingCustomRecords.value);

// ── Grid data ──
const gridData = computed<BentoDatagridDataItem[]>(() => {
    const source = customRecords.value as Array<IReport & Record<string, any>>;
    if (!source.length) return [];
    const keys = customFieldKeys.value;
    return source.map((report, idx) => {
        const row: BentoDatagridDataItem = {
            id: `${report.createdAt}-${idx}`,
            createdAt: report.createdAt ?? '',
            reportType: getReportType(i18n, report.type) ?? report.type,
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
        hideFirstLastPageButtons: true,
    };
});

const emptyStateProps = computed(() => ({
    image: 'no-results-found' as const,
    variant: 'embedded' as const,
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

const { dateFormat } = useTimezoneAwareDateFormatting('UTC');

function formatDate(dateStr: string): string {
    return dateFormat(dateStr, DATE_FORMAT_REPORTS);
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
    <div :class="styles.root">
        <!-- Download error alert -->
        <div v-if="alert" :class="styles.alert" role="alert">
            <div>
                <strong>{{ alert.title }}</strong>
                <p>{{ alert.description }}</p>
            </div>
            <BentoButton variant="tertiary" size="small" @click="removeAlert">&times;</BentoButton>
        </div>

        <DataOverviewError
            v-if="props.error"
            :error="props.error"
            :error-message="'reports.overview.errors.listUnavailable'"
            :on-contact-support="props.onContactSupport"
            :refresh-icon="RefreshIcon"
            :copy-icon="CopyIcon"
        />

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
                <time v-if="item.createdAt" :datetime="item.createdAt">
                    <BentoTypography variant="body">{{ formatDate(item.createdAt) }}</BentoTypography>
                </time>
            </template>
            <template #item-reportType="{ item }">
                {{ item.reportType }}
            </template>
            <template #item-dateAndReportType="{ item }">
                <div :class="styles.dateReportType">
                    <BentoTypography v-if="item.reportType" variant="body" stronger>{{ item.reportType }}</BentoTypography>
                    <time v-if="item.createdAt" :datetime="item.createdAt">
                        <BentoTypography variant="body" :class="styles.date">{{ formatDate(item.createdAt) }}</BentoTypography>
                    </time>
                </div>
            </template>
            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
