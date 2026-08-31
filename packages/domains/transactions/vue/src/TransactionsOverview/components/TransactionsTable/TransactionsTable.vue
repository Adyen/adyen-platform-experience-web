<script setup lang="ts">
import { computed, ref } from 'vue';
import { CustomDataCell, DataOverviewError, useTableColumns, type DataOverviewErrorPresentation } from '@integration-components/composables-vue';
import { useContainerQuery } from '@integration-components/composables-vue/useContainerQuery';
import { containerQueries } from '@integration-components/composables-vue/containerQueries';
import {
    BentoDataGrid,
    BentoTypography,
    BentoTag,
    BentoPaymentMethod,
    BentoColumnOverflow,
    BentoTooltipDirective as vBentoTooltip,
} from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import {
    getTransactionCategoryDescription,
    getTransactionCategory,
    TRANSACTION_FIELDS,
    type TransactionsTranslationKey,
} from '../../../../../domain/src';
import type { ITransaction, CustomColumn } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableFields, IBalanceAccountBase } from '../../types';
import { DATE_FORMAT_TRANSACTIONS } from '@integration-components/utils/datetime/formats';
import { parsePaymentMethodType } from '@integration-components/utils';
import styles from './TransactionsTable.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { formatDate as formatTransactionDate, getCurrencyCode } from '../../../integration/format';

const props = defineProps<{
    activeBalanceAccount?: IBalanceAccountBase;
    availableCurrencies?: string[];
    errorPresentation?: DataOverviewErrorPresentation;
    hasMultipleCurrencies: boolean;
    loading: boolean;
    onRowClick?: (transaction: ITransaction) => void;
    transactions?: ITransaction[];
    customColumns?: CustomColumn<StringWithAutocompleteOptions<TransactionsTableFields>>[];
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useTransactionsContext();

const containerRef = ref<HTMLElement | null>(null);
const isMobile = useContainerQuery(containerQueries.down.sm, containerRef);

const FIELDS_KEYS = {
    createdAt: 'transactions.overview.list.fields.createdAt',
    currency: 'transactions.overview.list.fields.currency',
    grossAmount: 'transactions.overview.list.fields.grossAmount',
    netAmount: 'transactions.overview.list.fields.netAmount',
    paymentMethod: 'transactions.overview.list.fields.paymentMethod',
    transactionType: 'transactions.overview.list.fields.transactionType',
} as const;

function amountLabel(field: 'netAmount' | 'grossAmount', defaultLabel: string): string {
    const currency = props.availableCurrencies?.[0];
    const currencyCode = currency ? getCurrencyCode(currency) : undefined;
    return props.hasMultipleCurrencies || !currencyCode ? defaultLabel : `${defaultLabel} (${currencyCode})`;
}

const { columns: desktopColumns, customFieldKeys } = useTableColumns({
    fields: TRANSACTION_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: FIELDS_KEYS,
    translate: key => i18n.get(key),
    columnConfig: () => ({
        createdAt: { flex: 1, minWidth: 140, overflow: BentoColumnOverflow.WRAP },
        paymentMethod: { flex: 1.2, minWidth: 150 },
        transactionType: { flex: 1, minWidth: 130 },
        currency: { flex: 0.7, minWidth: 90, visible: props.hasMultipleCurrencies },
        netAmount: { flex: 1, minWidth: 120, numeric: true },
        grossAmount: { flex: 1, minWidth: 120, numeric: true },
    }),
    customColumnDefaults: () => ({ flex: 1, minWidth: 120 }),
    resolveStandardColumnLabel: (field, defaultLabel) =>
        field === 'netAmount' || field === 'grossAmount' ? amountLabel(field, defaultLabel) : defaultLabel,
    resolveCustomColumnLabel: key => {
        const labelKey = `transactions.overview.list.fields.${key}`;
        return i18n.has(labelKey) ? i18n.get(labelKey) : i18n.get(key as TransactionsTranslationKey);
    },
});

const isLoading = computed(() => props.loading);

const columns = computed<BentoColumn[]>(() => {
    const grossAmountLabel = amountLabel('grossAmount', i18n.get(FIELDS_KEYS.grossAmount));

    if (isMobile.value) {
        return [
            { field: 'paymentMethodAndDate', label: i18n.get(FIELDS_KEYS.paymentMethod), flex: 2, minWidth: 150 },
            { field: 'grossAmount', label: grossAmountLabel, flex: 1, minWidth: 120, numeric: true },
        ];
    }

    return desktopColumns.value;
});

const gridData = computed<BentoDatagridDataItem[]>(() => {
    const source = (props.transactions ?? []) as Array<ITransaction & Record<string, any>>;
    if (!source.length) return [];
    return source.map((tx, idx) => {
        const row: BentoDatagridDataItem = {
            id: `${tx.id}-${idx}`,
            createdAt: tx.createdAt ?? '',
            paymentMethod: tx.paymentMethod ?? null,
            bankAccount: tx.bankAccount ?? null,
            transactionType: tx.category ?? '',
            currency: tx.amountBeforeDeductions?.currency ?? '',
            netAmount: tx.netAmount ?? null,
            grossAmount: tx.amountBeforeDeductions ?? null,
            paymentMethodAndDate: null,
            _raw: tx,
        };
        for (const key of customFieldKeys.value) {
            row[key] = tx[key];
        }
        return row;
    });
});

const paginationProps = computed(() => ({
    page: props.currentPage ?? 1,
    size: props.limit ?? 10,
    hasNext: props.hasNext ?? false,
    hasPrevious: props.hasPrevious ?? false,
    hidePageSize: !props.limitOptions || props.limitOptions.length <= 1,
    hideFirstLastPageButtons: true,
}));

const emptyStateProps = computed(() => ({
    image: 'no-results-found' as const,
    variant: 'embedded' as const,
    title: i18n.get('transactions.overview.errors.listEmpty'),
    description: i18n.get('transactions.errors.updateFilters'),
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
    props.onRowClick?.(item._raw as ITransaction);
}

function formatDate(dateStr: string): string {
    return formatTransactionDate(i18n, dateStr, DATE_FORMAT_TRANSACTIONS, props.activeBalanceAccount?.timeZone);
}

function formatAmount(amount: { value: number; currency: string } | null | undefined): string {
    if (!amount) return '';
    return i18n.amount(amount.value, amount.currency, { hideCurrency: !props.hasMultipleCurrencies });
}
</script>

<template>
    <div ref="containerRef">
        <DataOverviewError v-if="props.errorPresentation" v-bind="props.errorPresentation" />

        <BentoDataGrid
            v-else
            :columns="columns"
            :data="gridData"
            :loading="isLoading"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
            :allow-row-clicks="true"
            :has-resizable-columns="false"
            :allow-column-drag-and-drop="false"
            @row-click="handleRowClick"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #item-paymentMethodAndDate="{ item }">
                <div :class="styles.dateAndPaymentMethod">
                    <div :class="styles.paymentMethod">
                        <template v-if="item.paymentMethod || item.bankAccount">
                            <BentoPaymentMethod :type="item.paymentMethod ? item.paymentMethod?.type : 'bankTransfer'" />
                            <BentoTypography variant="body">
                                {{ item.paymentMethod ? parsePaymentMethodType(item.paymentMethod) : item.bankAccount?.accountNumberLastFourDigits }}
                            </BentoTypography>
                        </template>
                        <BentoTag v-else variant="grey" :label="i18n.get('transactions.tags.noData')" />
                    </div>
                    <time v-if="item.createdAt" :datetime="item.createdAt" :class="styles.date">
                        <BentoTypography variant="body">{{ formatDate(item.createdAt) }}</BentoTypography>
                    </time>
                </div>
            </template>

            <template #item-createdAt="{ item }">
                <time v-if="item.createdAt" :datetime="item.createdAt">
                    <BentoTypography variant="body">{{ formatDate(item.createdAt) }}</BentoTypography>
                </time>
            </template>

            <template #item-paymentMethod="{ item }">
                <div :class="styles.paymentMethod">
                    <template v-if="item.paymentMethod || item.bankAccount">
                        <BentoPaymentMethod :type="item.paymentMethod ? item.paymentMethod?.type : 'bankTransfer'" />
                        <BentoTypography variant="body">
                            {{ item.paymentMethod ? parsePaymentMethodType(item.paymentMethod) : item.bankAccount?.accountNumberLastFourDigits }}
                        </BentoTypography>
                    </template>
                    <BentoTag v-else variant="grey" :label="i18n.get('transactions.tags.noData')" />
                </div>
            </template>

            <template #item-transactionType="{ item }">
                <BentoTypography v-bento-tooltip="getTransactionCategoryDescription(i18n, item.transactionType) ?? ''" variant="body">
                    {{ getTransactionCategory(i18n, item.transactionType) }}
                </BentoTypography>
            </template>

            <template #item-currency="{ item }">
                <BentoTag variant="grey" :label="item.currency" />
            </template>

            <template #item-netAmount="{ item }">
                <BentoTypography variant="body">
                    {{ formatAmount(item.netAmount) }}
                </BentoTypography>
            </template>

            <template #item-grossAmount="{ item }">
                <BentoTypography variant="body">
                    {{ formatAmount(item.grossAmount) }}
                </BentoTypography>
            </template>

            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
