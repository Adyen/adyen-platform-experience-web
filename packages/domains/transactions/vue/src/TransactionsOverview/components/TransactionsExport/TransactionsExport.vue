<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext, useConfigContext, useEventDispatcherContext } from '@integration-components/core/vue';
import {
    BentoAlert,
    BentoButton,
    BentoDivider,
    BentoPopover,
    BentoTag,
    BentoToggle,
    BentoTypography,
    useBentoToastController,
    useClickOutside,
} from '@adyen/bento-vue3';
import { useDownload, useUniqueId } from '@integration-components/composables-vue';
import { isFunction, downloadBlob, EMPTY_ARRAY } from '@integration-components/utils';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { EXPORT_COLUMNS, DEFAULT_EXPORT_COLUMNS } from '../../constants';
import {
    TRANSACTION_ANALYTICS_CATEGORY,
    TRANSACTION_ANALYTICS_SUBCATEGORY_LIST,
    type TransactionsTranslationKey,
} from '@integration-components/transactions/domain';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import styles from './TransactionsExport.module.scss';

const props = defineProps<{ disabled?: boolean }>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const userEvents = useEventDispatcherContext();
const { filters } = useTransactionsOverviewContext();

const { addToast } = useBentoToastController();
let activeExportErrorToast: ReturnType<typeof addToast> | undefined;

const popoverOpen = ref(false);
const exportStarted = ref(false);
const exportColumns = ref<readonly (typeof EXPORT_COLUMNS)[number][]>(DEFAULT_EXPORT_COLUMNS);

const targetElement = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const exportButtonId = `elem-${useUniqueId()}`;

const sharedAnalyticsProps = { category: TRANSACTION_ANALYTICS_CATEGORY, subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_LIST } as const;

const canDownloadTransactions = computed(() => isFunction(config.endpoints.downloadTransactions));

const activeFilters = computed<readonly TransactionsTranslationKey[]>(() => {
    const { balanceAccountId, paymentPspReference, createdSince, createdUntil, categories, currencies } = filters.value;
    return [
        ...(balanceAccountId ? (['transactions.overview.export.filters.account'] as const) : EMPTY_ARRAY),
        ...(createdSince && createdUntil ? (['transactions.overview.export.filters.date'] as const) : EMPTY_ARRAY),
        ...(categories.length ? (['transactions.overview.export.filters.category'] as const) : EMPTY_ARRAY),
        ...(currencies.length ? (['transactions.overview.export.filters.currency'] as const) : EMPTY_ARRAY),
        ...(paymentPspReference ? (['transactions.overview.export.filters.paymentPspReference'] as const) : EMPTY_ARRAY),
    ] as readonly TransactionsTranslationKey[];
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
    if (err) {
        activeExportErrorToast = addToast({ text: i18n.get('transactions.overview.export.errors.download') });
    }
});

watch(popoverOpen, isOpen => {
    if (isOpen) {
        activeExportErrorToast?.dismiss();
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

useClickOutside(
    popoverRef,
    () => {
        if (popoverOpen.value) {
            dismissPopover();
        }
    },
    { ignore: [targetElement] }
);

const masterSwitchChecked = computed(() => exportColumns.value.length === EXPORT_COLUMNS.length);

const columnSwitches = computed(() =>
    EXPORT_COLUMNS.map(column => ({
        column,
        label: i18n.get(`transactions.overview.export.columns.${column}` as TransactionsTranslationKey),
        checked: exportColumns.value.includes(column),
    }))
);

function togglePopover() {
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
        title: i18n.get('transactions.overview.export.download'),
        ...(isFetching.value ? ({ state: 'loading' } as const) : {}),
    },
    {
        event: dismissPopover,
        title: i18n.get('transactions.overview.export.cancel'),
    },
]);
</script>

<template>
    <div v-if="canDownloadTransactions">
        <BentoButton
            :id="exportButtonId"
            ref="targetElement"
            variant="secondary"
            :disabled="props.disabled || isFetching"
            :aria-label="i18n.get('transactions.overview.export.buttonLabel')"
            aria-haspopup="dialog"
            :aria-expanded="popoverOpen"
            @click="togglePopover"
        >
            <template #iconLeft>
                <DownloadIcon />
            </template>
            {{ isFetching ? i18n.get('transactions.overview.export.buttonInProgress') : i18n.get('transactions.overview.export.buttonLabel') }}
        </BentoButton>

        <BentoPopover
            v-if="popoverOpen"
            ref="popoverRef"
            :open="popoverOpen"
            :target-element="targetElement ?? undefined"
            position="bottom-end"
            :dismissible="false"
            :disable-focus-trap="false"
            :actions="popoverActions"
            @dismiss="dismissPopover"
        >
            <div :class="styles.popoverSections">
                <div :class="styles.filters">
                    <BentoTypography variant="body" strongest>
                        {{ `${i18n.get('transactions.overview.export.filters.title')}:` }}
                    </BentoTypography>
                    <BentoTag v-for="filter in activeFilters" :key="filter" variant="grey" :label="i18n.get(filter)" />
                </div>

                <BentoDivider />

                <div :class="styles.columns">
                    <BentoTypography variant="body" strongest>
                        {{ i18n.get('transactions.overview.export.columns.title') }}
                    </BentoTypography>
                    <BentoToggle label-position="after" :value="masterSwitchChecked" @input="onMasterSwitchChange">
                        {{ i18n.get('transactions.overview.export.columns.all', { values: { count: EXPORT_COLUMNS.length } }) }}
                    </BentoToggle>
                    <BentoToggle
                        v-for="{ column, label, checked } in columnSwitches"
                        :key="column"
                        label-position="after"
                        :value="checked"
                        @input="(val: boolean) => onColumnChange(column, val)"
                    >
                        {{ label }}
                    </BentoToggle>
                </div>
            </div>

            <BentoAlert type="highlight" variant="tip">
                <template #description>
                    <BentoTypography variant="body" el="span" strongest>
                        {{ i18n.get('transactions.overview.export.downloadInfo') }}
                    </BentoTypography>
                </template>
            </BentoAlert>
        </BentoPopover>
    </div>
</template>
