<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
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
import { useUniqueId } from '@integration-components/composables-vue';
import { downloadBlob, EMPTY_ARRAY } from '@integration-components/utils';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { EXPORT_COLUMNS, DEFAULT_EXPORT_COLUMNS } from '../../constants';
import type { TransactionsTranslationKey } from '@integration-components/transactions/domain';
import DownloadIcon from '@adyen/ui-assets-icons-16/vue/download';
import styles from './TransactionsExport.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { transactionsOverviewEventBridge } from '../../../events';

const props = defineProps<{ disabled?: boolean }>();

const { i18n, runtime } = useTransactionsContext();
const events = transactionsOverviewEventBridge.useEvents();
const { filters } = useTransactionsOverviewContext();

const { addToast } = useBentoToastController();
let activeExportErrorToast: ReturnType<typeof addToast> | undefined;

const popoverOpen = ref(false);
const isFetching = ref(false);
const error = ref<unknown>();
const exportColumns = ref<readonly (typeof EXPORT_COLUMNS)[number][]>(DEFAULT_EXPORT_COLUMNS);

const targetElement = ref<HTMLElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const exportButtonId = `elem-${useUniqueId()}`;

const canDownloadTransactions = computed(() => runtime.canDownload);

const activeFilters = computed<readonly TransactionsTranslationKey[]>(() => {
    const { balanceAccountId, paymentPspReference, createdSince, createdUntil, categories, currencies } = filters.value;
    return [
        ...(balanceAccountId ? (['transactions.overview.export.filters.types.account'] as const) : EMPTY_ARRAY),
        ...(createdSince && createdUntil ? (['transactions.overview.export.filters.types.date'] as const) : EMPTY_ARRAY),
        ...(categories.length ? (['transactions.overview.export.filters.types.category'] as const) : EMPTY_ARRAY),
        ...(currencies.length ? (['transactions.overview.export.filters.types.currency'] as const) : EMPTY_ARRAY),
        ...(paymentPspReference ? (['transactions.overview.export.filters.types.paymentPspReference'] as const) : EMPTY_ARRAY),
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

watch(error, err => {
    if (err) {
        activeExportErrorToast = addToast({ text: i18n.get('transactions.overview.export.actions.error') });
    }
});

watch(popoverOpen, isOpen => {
    if (isOpen) {
        activeExportErrorToast?.dismiss();
    } else {
        exportColumns.value = DEFAULT_EXPORT_COLUMNS;
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
        label: i18n.get(`transactions.overview.export.columns.types.${column}` as TransactionsTranslationKey),
        checked: exportColumns.value.includes(column),
    }))
);

function togglePopover() {
    if (popoverOpen.value) {
        events.exportCancelled({ view: 'transactions' });
    } else {
        events.exportOpened({ view: 'transactions' });
    }
    popoverOpen.value = !popoverOpen.value;
}

function dismissPopover() {
    events.exportCancelled({ view: 'transactions' });
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

function getExportedFields(): 'all' | 'custom' | 'default' {
    const exportingAllFields = EXPORT_COLUMNS.every(column => exportColumns.value.includes(column));
    if (exportingAllFields) return 'all';
    const exportingOnlyDefaultFields = EXPORT_COLUMNS.every(column =>
        DEFAULT_EXPORT_COLUMNS.includes(column) ? exportColumns.value.includes(column) : !exportColumns.value.includes(column)
    );
    return exportingOnlyDefaultFields ? 'default' : 'custom';
}

let exportController: AbortController | undefined;

async function startExport() {
    if (!canDownloadTransactions.value || isFetching.value || exportColumns.value.length === 0) return;
    exportController?.abort();
    const controller = new AbortController();
    exportController = controller;
    isFetching.value = true;
    error.value = undefined;
    events.exportCompleted({ exportedFields: getExportedFields(), view: 'transactions' });

    try {
        const data = await runtime.downloadTransactions({ ...exportParams.value, signal: controller.signal });
        if (controller.signal.aborted) return;
        downloadBlob(data);
    } catch (nextError) {
        if (!controller.signal.aborted) error.value = nextError;
    } finally {
        if (!controller.signal.aborted) {
            isFetching.value = false;
            popoverOpen.value = false;
        }
    }
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

onUnmounted(() => exportController?.abort());
</script>

<template>
    <div v-if="canDownloadTransactions">
        <BentoButton
            :id="exportButtonId"
            ref="targetElement"
            variant="secondary"
            :disabled="props.disabled || isFetching"
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
                    <BentoTypography variant="body" strongest>{{ `${i18n.get('transactions.overview.export.filters.title')}:` }}</BentoTypography>
                    <BentoTag v-for="filter in activeFilters" :key="filter" variant="grey" :label="i18n.get(filter)" />
                </div>

                <BentoDivider />

                <div :class="styles.columns">
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
