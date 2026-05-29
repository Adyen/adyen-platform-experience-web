<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoButton, BentoAlert, BentoTypography, BentoTag, BentoToggle, BentoPopover, useClickOutside, BentoDivider } from '@adyen/bento-vue3';
import { useDownload, useUniqueId } from '@integration-components/composables-vue';
import { isFunction, downloadBlob, EMPTY_ARRAY } from '@integration-components/utils';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { EXPORT_COLUMNS, DEFAULT_EXPORT_COLUMNS } from '../../constants';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } from '@integration-components/transactions/domain';
import type { TranslationKey } from '@integration-components/core';
import './TransactionsExport.scss';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';

const { i18n } = useCoreContext();
const config = useConfigContext();
const userEvents = useEventDispatcherContext();
const { filters, transactionsListResult } = useTransactionsOverviewContext();

const hasNoResults = computed(() => !transactionsListResult.records.value?.length);

const popoverOpen = ref(false);
const exportError = ref<Error | undefined>(undefined);
const exportStarted = ref(false);
const exportColumns = ref<readonly (typeof EXPORT_COLUMNS)[number][]>(DEFAULT_EXPORT_COLUMNS);

const targetElement = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const exportButtonId = `elem-${useUniqueId()}`;

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } as const;

const canDownloadTransactions = computed(() => isFunction(config.endpoints.downloadTransactions));

const activeFilters = computed<readonly TranslationKey[]>(() => {
    const { balanceAccountId, paymentPspReference, createdSince, createdUntil, categories, currencies } = filters.value;
    return [
        ...(balanceAccountId ? (['transactions.overview.export.filters.types.account'] as const) : EMPTY_ARRAY),
        ...(createdSince && createdUntil ? (['transactions.overview.export.filters.types.date'] as const) : EMPTY_ARRAY),
        ...(categories.length ? (['transactions.overview.export.filters.types.category'] as const) : EMPTY_ARRAY),
        ...(currencies.length ? (['transactions.overview.export.filters.types.currency'] as const) : EMPTY_ARRAY),
        ...(paymentPspReference ? (['transactions.overview.export.filters.types.paymentPspReference'] as const) : EMPTY_ARRAY),
    ] as readonly TranslationKey[];
});

const exportParams = computed(() => ({
    balanceAccountId: filters.value.balanceAccountId ?? '',
    createdSince: filters.value.createdSince,
    createdUntil: filters.value.createdUntil,
    categories: filters.value.categories as string[],
    currencies: filters.value.currencies as string[],
    statuses: filters.value.statuses as string[],
    paymentPspReference: filters.value.paymentPspReference,
    sortDirection: 'desc' as const,
    columns: exportColumns.value as string[],
}));

const { isFetching, error } = useDownload(
    'downloadTransactions',
    () => ({ query: exportParams.value }),
    () => canDownloadTransactions.value && popoverOpen.value && exportStarted.value && exportColumns.value.length > 0,
    data => downloadBlob(data as any)
);

watch(error, err => {
    exportError.value = err;
});

watch(popoverOpen, isOpen => {
    if (isOpen) {
        exportError.value = undefined;
    } else {
        exportColumns.value = DEFAULT_EXPORT_COLUMNS;
    }
});

watch(
    exportStarted,
    started => {
        if (!started) return;
        exportStarted.value = false;

        let exportedFields: 'All' | 'Custom' | 'Default' = 'Custom';
        let exportingOnlyDefaultFields = true;
        let exportingAllFields = true;

        EXPORT_COLUMNS.forEach(column => {
            const isExportedField = exportColumns.value.includes(column);
            const isDefaultField = DEFAULT_EXPORT_COLUMNS.includes(column);
            exportingOnlyDefaultFields &&= isExportedField ? isDefaultField : !isDefaultField;
            exportingAllFields &&= isExportedField;
        });

        if (exportingAllFields) exportedFields = 'All';
        else if (exportingOnlyDefaultFields) exportedFields = 'Default';

        userEvents.addEvent?.('Completed export', { ...sharedAnalyticsProps, exportedFields });
    },
    { flush: 'post' }
);

watch(isFetching, (fetching, wasFetching) => {
    if (wasFetching && !fetching) {
        popoverOpen.value = false;
    }
});

let dismissedByClickOutside = false;

useClickOutside(popoverRef, () => {
    if (popoverOpen.value) {
        dismissedByClickOutside = true;
        dismissPopover();
        requestAnimationFrame(() => {
            dismissedByClickOutside = false;
        });
    }
});

const masterSwitchChecked = computed(() => exportColumns.value.length === EXPORT_COLUMNS.length);

const columnSwitches = computed(() =>
    EXPORT_COLUMNS.map(column => ({
        column,
        label: i18n.get(`transactions.overview.export.columns.types.${column}` as TranslationKey),
        checked: exportColumns.value.includes(column),
    }))
);

function togglePopover() {
    if (dismissedByClickOutside) {
        return;
    }
    if (popoverOpen.value) {
        userEvents.addEvent?.('Cancelled export', sharedAnalyticsProps);
    } else {
        userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsProps, label: 'Export' });
    }
    popoverOpen.value = !popoverOpen.value;
}

function dismissPopover() {
    userEvents.addEvent?.('Cancelled export', sharedAnalyticsProps);
    popoverOpen.value = false;
}

function onMasterSwitchChange(checked: boolean) {
    exportColumns.value = checked ? EXPORT_COLUMNS : EMPTY_ARRAY;
}

function onColumnChange(column: (typeof EXPORT_COLUMNS)[number], checked: boolean) {
    if (checked) {
        if (!exportColumns.value.includes(column)) {
            exportColumns.value = [...exportColumns.value, column];
        }
    } else {
        exportColumns.value = exportColumns.value.filter(c => c !== column);
    }
}

function startExport() {
    exportStarted.value = true;
}

const popoverActions = computed(() => [
    {
        disabled: !exportColumns.value.length,
        event: startExport,
        title: i18n.get('transactions.overview.export.actions.download'),
        ...(isFetching.value ? ({ state: 'loading' } as const) : {}),
    },
    {
        event: dismissPopover,
        title: i18n.get('transactions.overview.export.actions.cancel'),
    },
]);
</script>

<template>
    <div v-if="canDownloadTransactions" class="adyen-pe-transactions-export">
        <BentoButton
            :id="exportButtonId"
            ref="targetElement"
            variant="secondary"
            :disabled="isFetching || hasNoResults"
            :aria-label="i18n.get('transactions.overview.export.button.label')"
            aria-haspopup="dialog"
            :aria-expanded="popoverOpen"
            @click="togglePopover"
        >
            <template #iconLeft>
                <DownloadIcon />
            </template>
            {{ isFetching ? i18n.get('transactions.overview.export.button.inProgress') : i18n.get('transactions.overview.export.button.label') }}
        </BentoButton>

        <BentoAlert v-if="exportError" type="critical" @close="exportError = undefined">
            <template #description>{{ i18n.get('transactions.overview.export.actions.error') }}</template>
        </BentoAlert>

        <BentoPopover
            ref="popoverRef"
            :open="popoverOpen"
            :target-element="targetElement ?? undefined"
            position="bottom-end"
            :dismissible="false"
            :disable-focus-trap="false"
            :actions="popoverActions"
            @dismiss="dismissPopover"
        >
            <div class="adyen-pe-transactions-export__popover-sections">
                <div class="adyen-pe-transactions-export__popover-section--filters">
                    <BentoTypography variant="body" strongest>{{ `${i18n.get('transactions.overview.export.filters.title')}:` }}</BentoTypography>
                    <BentoTag v-for="filter in activeFilters" :key="filter" variant="grey" :label="i18n.get(filter)" />
                </div>

                <BentoDivider />

                <div class="adyen-pe-transactions-export__popover-section--columns">
                    <BentoTypography variant="body" strongest>{{ i18n.get('transactions.overview.export.columns.title') }}</BentoTypography>
                    <BentoToggle label-position="after" :value="masterSwitchChecked" @input="onMasterSwitchChange">
                        {{ i18n.get('transactions.overview.export.columns.types.all', { values: { count: EXPORT_COLUMNS.length } }) }}
                    </BentoToggle>
                    <BentoToggle
                        v-for="{ column, label, checked } in columnSwitches"
                        label-position="after"
                        :key="column"
                        :value="checked"
                        @input="(val: boolean) => onColumnChange(column, val)"
                        class="adyen-pe-transactions-export__popover-section--toggle"
                    >
                        {{ label }}
                    </BentoToggle>
                </div>
            </div>

            <BentoAlert type="highlight">
                <template #default>{{ i18n.get('transactions.overview.export.actions.download.info') }}</template>
            </BentoAlert>
        </BentoPopover>
    </div>
</template>
