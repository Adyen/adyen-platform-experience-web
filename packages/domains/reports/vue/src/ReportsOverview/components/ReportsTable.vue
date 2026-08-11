<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { BentoDataGrid, BentoToast, BentoTypography, useBentoToastController } from '@adyen/bento-vue3';
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
import { DATE_FORMAT_REPORTS, downloadBlob } from '@integration-components/utils';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { BentoDatagridDataItem, BentoDataGridRowActionsProp } from '@adyen/bento-vue3';
import type { CustomColumn, IReport, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { getReportType, REPORTS_TABLE_CLASS_NAMES, REPORTS_DOWNLOAD_DISABLED_TIMEOUT, REPORTS_TABLE_FIELDS } from '../../../../domain/src';
import DownloadErrorIcon from './DownloadErrorIcon.vue';
import SmallLoadingIndicator from './SmallLoadingIndicator.vue';
import '../styles/ReportsTable.scss';

export type ReportsTableFields = (typeof REPORTS_TABLE_FIELDS)[number];

// ── Immutable set utils ──
const withItem = <T,>(set: Set<T>, item: T) => {
    return set.has(item) ? set : new Set(set).add(item);
};

const withoutItem = <T,>(set: Set<T>, item: T) => {
    if (set.has(item)) {
        const nextSet = new Set(set);
        nextSet.delete(item);
        return nextSet;
    }
    return set;
};

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
const downloadingReportKeys = ref<Set<string>>(new Set());
const failedReportKeys = ref<Set<string>>(new Set());
const retryingReportKeys = ref<Set<string>>(new Set());

let freezeTimeoutId: ReturnType<typeof setTimeout> | undefined;

function getReportKey(report: IReport) {
    return `${report.createdAt}-${report.type}`;
}

function isDownloadingReport(reportKey: string) {
    return downloadingReportKeys.value.has(reportKey) || retryingReportKeys.value.has(reportKey);
}

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

const { addToast } = useBentoToastController();
let activeDownloadErrorToast: ReturnType<typeof addToast> | undefined;

function onDownloadErrorAlert(reportKey: string, error?: AdyenPlatformExperienceError) {
    failedReportKeys.value = withItem(failedReportKeys.value, reportKey);

    // prettier-ignore
    const text = error?.errorCode === '999_429_001'
        ? i18n.get('reports.overview.errors.tooManyDownloads')
        : i18n.get('reports.overview.errors.retryDownload');

    activeDownloadErrorToast?.dismiss();
    activeDownloadErrorToast = addToast({ text });
}

// ── Download handler ──
async function handleDownload(item: IReport) {
    const downloadReport = config.endpoints.downloadReport;
    if (typeof downloadReport !== 'function') return;

    const reportKey = getReportKey(item);
    if (frozen.value || isDownloadingReport(reportKey)) return;

    freeze();
    downloadingReportKeys.value = withItem(downloadingReportKeys.value, reportKey);

    if (failedReportKeys.value.has(reportKey)) {
        failedReportKeys.value = withoutItem(failedReportKeys.value, reportKey);
        retryingReportKeys.value = withItem(retryingReportKeys.value, reportKey);
    }

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
            downloadBlob(result, 'report.csv');
        }
    } catch (e) {
        onDownloadErrorAlert(reportKey, e as AdyenPlatformExperienceError);
    } finally {
        downloadingReportKeys.value = withoutItem(downloadingReportKeys.value, reportKey);
        retryingReportKeys.value = withoutItem(retryingReportKeys.value, reportKey);
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
const getRowActions: BentoDataGridRowActionsProp = (item: BentoDatagridDataItem) => {
    const report = item._raw as IReport;
    const reportKey = getReportKey(report);
    const isDownloading = isDownloadingReport(reportKey);
    const ButtonIcon = failedReportKeys.value.has(reportKey) ? DownloadErrorIcon : DownloadIcon;

    const label = isDownloading
        ? `${i18n.get('common.actions.download.labels.inProgress')}..`
        : i18n.get('reports.overview.list.controls.downloadReport.label');

    return [
        {
            title: label,
            event: () => handleDownload(report),
            tooltipText: label,
            disabled: frozen.value || isDownloading,
            iconLeft: isDownloading ? SmallLoadingIndicator : ButtonIcon,
        },
    ];
};

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
</script>

<template>
    <div :class="REPORTS_TABLE_CLASS_NAMES.base">
        <BentoToast />

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
                <div :class="REPORTS_TABLE_CLASS_NAMES.dateReportType">
                    <BentoTypography v-if="item.reportType" variant="body" stronger>{{ item.reportType }}</BentoTypography>
                    <time v-if="item.createdAt" :datetime="item.createdAt">
                        <BentoTypography variant="body" :class="REPORTS_TABLE_CLASS_NAMES.dateReportTypeDate">{{
                            formatDate(item.createdAt)
                        }}</BentoTypography>
                    </time>
                </div>
            </template>
            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
