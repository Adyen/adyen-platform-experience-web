<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { BentoDataGrid, BentoButton } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { useConfigContext } from '../../../core/ConfigContext';
import type { IReport } from '../types';
import { TABLE_CLASS, DISABLED_BUTTONS_TIMEOUT } from '../constants';
import '../styles/ReportsTable.scss';

const props = defineProps<{
    balanceAccountId: string | undefined;
    loading: boolean;
    error?: Error;
    onContactSupport?: () => void;
    showPagination: boolean;
    data: IReport[] | undefined;
    customColumns?: any[];
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
const { endpoints, refreshing } = useConfigContext();

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

function onDownloadErrorAlert(error?: Error) {
    const errorCode = (error as any)?.errorCode;
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
    const downloadReport = endpoints.downloadReport;
    if (typeof downloadReport !== 'function') return;

    freeze();
    alert.value = null;

    try {
        const result = await downloadReport(
            {},
            {
                query: {
                    balanceAccountId: props.balanceAccountId ?? '',
                    createdAt: item.createdAt,
                    type: item.type,
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
        onDownloadErrorAlert(e as Error);
    }
}

// ── Grid columns ──
const isLoading = computed(() => props.loading || refreshing);

const columns = computed<BentoColumn[]>(() => {
    const cols: BentoColumn[] = [
        { field: 'createdAt', label: i18n.get('reports.overview.list.fields.createdAt'), minWidth: 200, flex: 1, mandatory: true },
        { field: 'reportType', label: i18n.get('reports.overview.list.fields.reportType'), minWidth: 140, flex: 1 },
        { field: 'reportFile', label: i18n.get('reports.overview.list.fields.reportFile'), minWidth: 120, flex: 1 },
    ];
    return cols;
});

// ── Grid data ──
const gridData = computed<BentoDatagridDataItem[]>(() => {
    if (!props.data) return [];
    return props.data.map((report: IReport, idx: number) => ({
        id: `${report.createdAt}-${idx}`,
        createdAt: formatReportDate(report.createdAt),
        reportType: getReportType(report.type),
        reportFile: i18n.get('reports.overview.list.controls.downloadReport.label'),
        _raw: report,
    }));
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

// Clear alert when loading starts
if (props.loading) alert.value = null;
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
            :columns="columns"
            :data="gridData"
            :loading="isLoading"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
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
            <template #item-reportFile="{ item }">
                <bento-button
                    variant="secondary"
                    :disabled="frozen"
                    :aria-label="i18n.get('reports.overview.list.controls.downloadReport.label')"
                    @click.stop="handleDownload(item._raw as IReport)"
                >
                    {{ i18n.get('reports.overview.list.controls.downloadReport.label') }}
                </bento-button>
            </template>
        </BentoDataGrid>
    </div>
</template>
