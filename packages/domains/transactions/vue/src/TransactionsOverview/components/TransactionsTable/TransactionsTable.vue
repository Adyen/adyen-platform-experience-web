<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useTimezoneAwareDateFormatting, useResponsiveContainer, containerQueries, CustomDataCell } from '@integration-components/composables-vue';
import { BentoDataGrid, BentoTypography, BentoTag, BentoPaymentMethod, BentoButton, BentoColumnOverflow } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import { getTransactionCategoryDescription, getTransactionCategory } from '@integration-components/transactions/domain';
import { TRANSACTION_FIELDS } from '@integration-components/transactions/domain';
import { getCurrencyCode } from '@integration-components/core/Localization/amount/amount-util';
import type { ITransaction, CustomColumn } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { TransactionsTableFields } from '../../types';
import type { IBalanceAccountBase } from '../../types';
import { TABLE_CLASS, AMOUNT_CLASS, PAYMENT_METHOD_CLASS, DATE_AND_PAYMENT_METHOD_CLASS, DATE_METHOD_CLASS } from '../../constants';
import { DATE_FORMAT_TRANSACTIONS } from '@integration-components/utils/datetime/formats';
import './TransactionsTable.scss';
import { parsePaymentMethodType } from '@integration-components/utils';

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
    limitOptions?: number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting(props.activeBalanceAccount?.timeZone);

const containerRef = ref<HTMLElement | null>(null);
const isMobile = useResponsiveContainer(containerRef, containerQueries.down.sm);

const STANDARD_FIELDS = new Set<string>(TRANSACTION_FIELDS);

const FIELDS_KEYS: Record<string, string> = {
    createdAt: 'transactions.overview.list.fields.createdAt',
    currency: 'transactions.overview.list.fields.currency',
    grossAmount: 'transactions.overview.list.fields.grossAmount',
    netAmount: 'transactions.overview.list.fields.netAmount',
    paymentMethod: 'transactions.overview.list.fields.paymentMethod',
    transactionType: 'transactions.overview.list.fields.transactionType',
};

const customFieldKeys = computed<string[]>(() =>
    (props.customColumns ?? [])
        .filter(c => !!c && c.visibility !== 'hidden')
        .map(c => (typeof c?.key === 'string' ? c.key.trim() : ''))
        .filter((k): k is string => !!k && !STANDARD_FIELDS.has(k))
);

const isLoading = computed(() => props.loading);

const columns = computed<BentoColumn[]>(() => {
    const currency0 = props.availableCurrencies?.[0];
    const currencyCode = currency0 ? getCurrencyCode(currency0) : undefined;

    const grossAmountLabel = props.hasMultipleCurrencies
        ? i18n.get(FIELDS_KEYS.grossAmount as any)
        : `${i18n.get(FIELDS_KEYS.grossAmount as any)}${currencyCode ? ` (${currencyCode})` : ''}`;

    if (isMobile.value) {
        return [
            { field: 'paymentMethodAndDate', label: i18n.get(FIELDS_KEYS.paymentMethod as any), flex: 2, minWidth: 150 },
            { field: 'grossAmount', label: grossAmountLabel, flex: 1, minWidth: 120, numeric: true },
        ];
    }

    const cols: BentoColumn[] = [
        { field: 'createdAt', label: i18n.get(FIELDS_KEYS.createdAt as any), flex: 1, minWidth: 140, overflow: BentoColumnOverflow.WRAP },
        { field: 'paymentMethod', label: i18n.get(FIELDS_KEYS.paymentMethod as any), flex: 1.2, minWidth: 150 },
        { field: 'transactionType', label: i18n.get(FIELDS_KEYS.transactionType as any), flex: 1, minWidth: 130 },
        {
            field: 'currency',
            label: i18n.get(FIELDS_KEYS.currency as any),
            flex: 0.7,
            minWidth: 90,
        },
        {
            field: 'netAmount',
            label: props.hasMultipleCurrencies
                ? i18n.get(FIELDS_KEYS.netAmount as any)
                : `${i18n.get(FIELDS_KEYS.netAmount as any)}${currencyCode ? ` (${currencyCode})` : ''}`,
            flex: 1,
            minWidth: 120,
            numeric: true,
        },
        { field: 'grossAmount', label: grossAmountLabel, flex: 1, minWidth: 120, numeric: true },
    ];

    for (const key of customFieldKeys.value) {
        const labelKey = `transactions.overview.list.fields.${key}`;
        cols.push({
            field: key,
            label: i18n.has(labelKey as any) ? i18n.get(labelKey as any) : i18n.get(key as any),
            flex: 1,
            minWidth: 120,
        });
    }

    return cols;
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
}));

const emptyStateProps = computed(() => ({
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
    <div ref="containerRef" :class="TABLE_CLASS">
        <div v-if="props.error" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('transactions.overview.errors.listUnavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>

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
                <div :class="DATE_AND_PAYMENT_METHOD_CLASS">
                    <div :class="PAYMENT_METHOD_CLASS">
                        <template v-if="item.paymentMethod || item.bankAccount">
                            <BentoPaymentMethod :type="item.paymentMethod ? item.paymentMethod?.type : 'bankTransfer'" />
                            <BentoTypography variant="body">
                                {{ item.paymentMethod ? parsePaymentMethodType(item.paymentMethod) : item.bankAccount?.accountNumberLastFourDigits }}
                            </BentoTypography>
                        </template>
                        <BentoTag v-else variant="grey" :label="i18n.get('common.tags.noData')" />
                    </div>
                    <time v-if="item.createdAt" :datetime="item.createdAt" :class="DATE_METHOD_CLASS">
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
                <div :class="PAYMENT_METHOD_CLASS">
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
                <BentoTypography variant="body" v-bento-tooltip="getTransactionCategoryDescription(i18n, item.transactionType) ?? ''">
                    {{ getTransactionCategory(i18n, item.transactionType) }}
                </BentoTypography>
            </template>

            <template #item-currency="{ item }">
                <BentoTag variant="grey" :label="item.currency" />
            </template>

            <template #item-netAmount="{ item }">
                <BentoTypography variant="body" :class="AMOUNT_CLASS">
                    {{ formatAmount(item.netAmount) }}
                </BentoTypography>
            </template>

            <template #item-grossAmount="{ item }">
                <BentoTypography variant="body" :class="AMOUNT_CLASS">
                    {{ formatAmount(item.grossAmount) }}
                </BentoTypography>
            </template>

            <template v-for="key in customFieldKeys" #[`item-${key}`]="{ item }" :key="key">
                <CustomDataCell :value="item[key]" />
            </template>
        </BentoDataGrid>
    </div>
</template>
