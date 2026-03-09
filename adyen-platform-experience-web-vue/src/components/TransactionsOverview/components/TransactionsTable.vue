<script setup lang="ts">
import { computed } from 'vue';
import { BentoDataGrid, BentoTag } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import PaymentMethodCell from './PaymentMethodCell.vue';
import { useCoreContext } from '../../../core/Context';
import type { ITransaction, IBalanceAccountBase, IAmount } from '../types';

const props = defineProps<{
    activeBalanceAccount?: IBalanceAccountBase;
    availableCurrencies: IAmount['currency'][] | undefined;
    loading: boolean;
    error?: Error;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick?: (value: ITransaction) => void;
    showPagination?: boolean;
    transactions: ITransaction[] | undefined;
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

const BASE_CLASS = 'adyen-pe-transactions-table';

const columns = computed<BentoColumn[]>(() => {
    const cols: BentoColumn[] = [
        { field: 'createdAt', label: i18n.get('transactions.overview.list.fields.createdAt'), minWidth: 160, mandatory: true },
        { field: 'paymentMethod', label: i18n.get('transactions.overview.list.fields.paymentMethod'), minWidth: 140 },
        { field: 'category', label: i18n.get('transactions.overview.list.fields.transactionType'), minWidth: 120 },
    ];

    if (props.hasMultipleCurrencies) {
        cols.push({ field: 'currency', label: i18n.get('transactions.overview.list.fields.currency'), width: 80 });
    }

    const currencySuffix = !props.hasMultipleCurrencies && props.availableCurrencies?.[0] ? ` (${props.availableCurrencies[0]})` : '';
    cols.push(
        { field: 'netAmount', label: `${i18n.get('transactions.overview.list.fields.netAmount')}${currencySuffix}`, numeric: true, minWidth: 120 },
        { field: 'grossAmount', label: `${i18n.get('transactions.overview.list.fields.grossAmount')}${currencySuffix}`, numeric: true, minWidth: 120 }
    );
    return cols;
});

const gridData = computed<BentoDatagridDataItem[]>(() => {
    if (!props.transactions) return [];
    return props.transactions.map(tx => ({
        id: tx.id,
        createdAt: i18n.date(tx.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
        paymentMethod: tx.paymentMethod?.description,
        bankAccount: tx.bankAccount,
        category: tx.category ? i18n.get(`transactions.common.types.${tx.category}`) : '',
        currency: tx.amountBeforeDeductions.currency,
        netAmount: i18n.amount(tx.netAmount.value, tx.netAmount.currency, { hideCurrency: !props.hasMultipleCurrencies }),
        grossAmount: i18n.amount(tx.amountBeforeDeductions.value, tx.amountBeforeDeductions.currency, { hideCurrency: !props.hasMultipleCurrencies }),
        _raw: tx,
    }));
});

const paginationProps = computed(() => {
    if (!props.showPagination) return undefined;
    return {
        page: props.currentPage ?? 1,
        size: props.limit ?? 20,
        hasNext: props.hasNext ?? false,
        hasPrevious: props.hasPrevious ?? false,
        hidePageSize: !props.limitOptions || props.limitOptions.length <= 1,
    };
});

const emptyStateProps = computed(() => ({
    title: i18n.get('transactions.overview.errors.listEmpty'),
    description: i18n.get('common.errors.updateFilters'),
}));

function handleRowClick(row: BentoDatagridDataItem) {
    props.onRowClick?.(row._raw as ITransaction);
}

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
</script>

<template>
    <div :class="BASE_CLASS">
        <!-- Error state -->
        <div v-if="props.error" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('transactions.overview.errors.listUnavailable') }}</p>
            <button v-if="props.onContactSupport" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport') }}
            </button>
        </div>

        <BentoDataGrid
            v-else
            :columns="columns"
            :data="gridData"
            :loading="props.loading"
            :allow-row-clicks="!!props.onRowClick"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
            :has-resizable-columns="false"
            :allow-column-drag-and-drop="false"
            @row-click="handleRowClick"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #createdAt="{ row }">
                <time :datetime="row.createdAt">
                    {{ i18n.date(row.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                </time>
            </template>
            <template #paymentMethod="{ row }">
                <PaymentMethodCell :payment-method="row.paymentMethod" :bank-account="row.bankAccount" />
            </template>
            <template #currency="{ row }">
                <BentoTag>{{ row.currency }}</BentoTag>
            </template>
        </BentoDataGrid>
    </div>
</template>
