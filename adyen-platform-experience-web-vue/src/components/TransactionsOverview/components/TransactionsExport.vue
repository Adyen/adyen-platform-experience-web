<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue';
import { BentoButton, BentoPopover, BentoToggle, BentoTag } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { useConfigContext } from '../../../core/ConfigContext';
import { getTransactionsFilterQueryParams, isFunction } from '../utils';
import { EXPORT_COLUMNS, DEFAULT_EXPORT_COLUMNS } from '../constants';
import type { TransactionsFilters } from '../types';

const props = defineProps<{
    disabled?: boolean;
    filters: Readonly<TransactionsFilters>;
    now: number;
}>();

const { i18n } = useCoreContext();
const { endpoints } = useConfigContext();

const popoverOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const exportError = ref<Error | undefined>();
const exportColumns = ref<readonly (typeof EXPORT_COLUMNS)[number][]>([...DEFAULT_EXPORT_COLUMNS]);
const isExporting = ref(false);

const downloadTransactions = computed(() => endpoints.downloadTransactions);
const canDownloadTransactions = computed(() => isFunction(downloadTransactions.value));

const exportButtonLabel = computed(() => i18n.get('transactions.overview.export.button.label'));
const exportingButtonLabel = computed(() => i18n.get('transactions.overview.export.button.inProgress'));
const activeFiltersTitle = computed(() => i18n.get('transactions.overview.export.filters.title'));
const exportColumnsTitle = computed(() => i18n.get('transactions.overview.export.columns.title'));

const masterSwitchChecked = computed(() => exportColumns.value.length === EXPORT_COLUMNS.length);

const columnSwitches = computed(() =>
    EXPORT_COLUMNS.map(column => ({
        label: i18n.get(`transactions.overview.export.columns.types.${column}`),
        value: column,
    }))
);

const masterSwitchLabel = computed(() => i18n.get('transactions.overview.export.columns.types.all', { values: { count: EXPORT_COLUMNS.length } }));

const activeFilters = computed(() => {
    const { balanceAccount, paymentPspReference, createdDate, categories, currencies } = props.filters;
    const filters: string[] = [];
    if (balanceAccount?.id) filters.push(i18n.get('transactions.overview.export.filters.types.account'));
    if (createdDate) filters.push(i18n.get('transactions.overview.export.filters.types.date'));
    if (categories.length) filters.push(i18n.get('transactions.overview.export.filters.types.category'));
    if (currencies.length) filters.push(i18n.get('transactions.overview.export.filters.types.currency'));
    if (paymentPspReference) filters.push(i18n.get('transactions.overview.export.filters.types.paymentPspReference'));
    return filters;
});

function togglePopover() {
    popoverOpen.value = !popoverOpen.value;
}

function dismissPopover() {
    console.log('trigger dismissPopover', triggerRef.value);
    popoverOpen.value = false;
}

function onExportColumnChange(column: (typeof EXPORT_COLUMNS)[number], checked: boolean) {
    if (checked) {
        if (!exportColumns.value.includes(column)) {
            exportColumns.value = [...exportColumns.value, column];
        }
    } else {
        exportColumns.value = exportColumns.value.filter(c => c !== column);
    }
}

function onMasterSwitchChange(checked: boolean) {
    exportColumns.value = checked ? [...EXPORT_COLUMNS] : [];
}

async function startExport() {
    const fn = downloadTransactions.value;
    if (!isFunction(fn) || !exportColumns.value.length) return;

    isExporting.value = true;
    exportError.value = undefined;
    dismissPopover();

    try {
        const exportParams = {
            ...getTransactionsFilterQueryParams(toRaw(props.filters), props.now),
            sortDirection: 'desc' as const,
            columns: exportColumns.value as string[],
        };
        const result = await fn({}, { query: exportParams as any });
        // Handle blob download
        if (result?.blob) {
            const url = URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename || 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } catch (e) {
        exportError.value = e as Error;
    } finally {
        isExporting.value = false;
    }
}

// Reset columns when popover opens
watch(popoverOpen, open => {
    if (!open) {
        exportColumns.value = [...DEFAULT_EXPORT_COLUMNS];
    }
    exportError.value = undefined;
});

const popoverActions = computed(() => [
    { title: i18n.get('transactions.overview.export.actions.download'), event: startExport, disabled: !exportColumns.value.length },
    { title: i18n.get('transactions.overview.export.actions.cancel'), event: dismissPopover },
]);

const BASE_CLASS = 'adyen-pe-transactions-export';
</script>

<template>
    <div v-if="canDownloadTransactions" :class="BASE_CLASS">
        <bento-button
            :disabled="props.disabled || isExporting"
            variant="secondary"
            @click="togglePopover"
            :aria-label="exportButtonLabel"
            ref="triggerRef"
        >
            {{ isExporting ? exportingButtonLabel : exportButtonLabel }}
        </bento-button>

        <!-- Export error alert -->
        <div v-if="exportError" :class="`${BASE_CLASS}__error-alert`" role="alert">
            <p>{{ i18n.get('transactions.overview.export.actions.error') }}</p>
            <bento-button variant="tertiary" size="small" @click="exportError = undefined">&times;</bento-button>
        </div>

        <!-- Export popover -->
        <bento-popover
            v-if="triggerRef"
            :open="popoverOpen"
            :target-element="triggerRef"
            position="bottom-end"
            :title="exportButtonLabel"
            :dismissible="true"
            :actions="popoverActions"
            @dismiss="dismissPopover"
        >
            <div :class="`${BASE_CLASS}__popover-sections`">
                <!-- Active filters section -->
                <div :class="`${BASE_CLASS}__popover-section ${BASE_CLASS}__popover-section--filters`">
                    <div :class="`${BASE_CLASS}__popover-section-title`">{{ activeFiltersTitle }}:</div>
                    <BentoTag v-for="filter in activeFilters" :key="filter">{{ filter }}</BentoTag>
                </div>

                <!-- Columns section -->
                <div :class="`${BASE_CLASS}__popover-section ${BASE_CLASS}__popover-section--columns`">
                    <div :class="`${BASE_CLASS}__popover-section-title`">{{ exportColumnsTitle }}</div>
                    <div :class="`${BASE_CLASS}__popover-section-content`">
                        <!-- Master switch -->
                        <BentoToggle :value="masterSwitchChecked" @input="onMasterSwitchChange">
                            {{ masterSwitchLabel }}
                        </BentoToggle>

                        <!-- Individual column switches -->
                        <BentoToggle
                            v-for="col in columnSwitches"
                            :key="col.value"
                            :value="exportColumns.includes(col.value)"
                            @input="(checked: boolean) => onExportColumnChange(col.value, checked)"
                        >
                            {{ col.label }}
                        </BentoToggle>
                    </div>
                </div>
            </div>

            <p>{{ i18n.get('transactions.overview.export.actions.download.info') }}</p>
        </bento-popover>
    </div>
</template>
