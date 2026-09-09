<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import {
    useTimezoneAwareDateFormatting,
    useResponsiveContainer,
    containerQueries,
    CustomDataCell,
    DataOverviewError,
    useTableColumns,
} from '@integration-components/composables-vue';
import {
    BentoDataGrid,
    BentoTypography,
    BentoTag,
    BentoPaymentMethod,
    BentoColumnOverflow,
    BentoTooltipDirective as vBentoTooltip,
} from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { getTransactionCategoryDescription, getTransactionCategory, TRANSACTION_FIELDS } from '../../../../../domain/src';
import { getCurrencyCode } from '@integration-components/core/Localization/amount/amount-util';
import type { ITransaction, CustomColumn } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableFields, IBalanceAccountBase } from '../../types';
import { DATE_FORMAT_TRANSACTIONS } from '@integration-components/utils/datetime/formats';
import { parsePaymentMethodType } from '@integration-components/utils';
import styles from './TransactionsTable.module.scss';

const props = defineProps<{
    activeBalanceAccount?: IBalanceAccountBase;
    availableCurrencies?: string[];
    error?: Error;
    hasMultipleCurrencies: boolean;
    loading: boolean;
    onContactSupport?: () => void;
    onRowClick?: (transaction: ITransaction) => void;
    showDetails?: boolean;
    transactions?: ITransaction[];
    customColumns?: CustomColumn<StringWithAutocompleteOptions<TransactionsTableFields>>[];
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: readonly number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting(() => props.activeBalanceAccount?.timeZone);

const isMobile = useResponsiveContainer(containerQueries.down.sm);

const FIELDS_KEYS: Record<string, string> = {
    createdAt: 'transactions.overview.list.fields.createdAt',
    currency: 'transactions.overview.list.fields.currency',
    grossAmount: 'transactions.overview.list.fields.grossAmount',
    netAmount: 'transactions.overview.list.fields.netAmount',
    paymentMethod: 'transactions.overview.list.fields.paymentMethod',
    transactionType: 'transactions.overview.list.fields.transactionType',
};

function amountLabel(field: 'netAmount' | 'grossAmount', defaultLabel: string): string {
    const currency = props.availableCurrencies?.[0];
    const currencyCode = currency ? getCurrencyCode(currency) : undefined;
    return props.hasMultipleCurrencies || !currencyCode ? defaultLabel : `${defaultLabel} (${currencyCode})`;
}

const { columns: desktopColumns, customFieldKeys } = useTableColumns({
    fields: TRANSACTION_FIELDS,
    customColumns: () => props.customColumns,
    fieldsKeys: FIELDS_KEYS,
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
        return i18n.has(labelKey as any) ? i18n.get(labelKey as any) : i18n.get(key as any);
    },
});

const isLoading = computed(() => props.loading);

const columns = computed<BentoColumn[]>(() => {
    const grossAmountLabel = amountLabel('grossAmount', i18n.get(FIELDS_KEYS.grossAmount as any));

    if (isMobile.value) {
        return [
            { field: 'paymentMethodAndDate', label: i18n.get(FIELDS_KEYS.paymentMethod as any), flex: 2, minWidth: 150 },
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
    description: i18n.get('common.errors.updateFilters'),
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
    return dateFormat(dateStr, DATE_FORMAT_TRANSACTIONS);
}

function formatAmount(amount: { value: number; currency: string } | null | undefined): string {
    if (!amount) return '';
    return i18n.amount(amount.value, amount.currency, { hideCurrency: !props.hasMultipleCurrencies });
}
</script>

<template>
    <div>
        <DataOverviewError
            v-if="props.error"
            :error="props.error"
            :error-message="'transactions.overview.errors.listUnavailable'"
            :on-contact-support="props.onContactSupport"
            :refresh-icon="RefreshIcon"
            :copy-icon="CopyIcon"
        />

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
                        <BentoTag v-else variant="grey" :label="i18n.get('common.tags.noData')" />
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
                    <BentoTag v-else variant="grey" :label="i18n.get('common.tags.noData')" />
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
