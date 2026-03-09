<script setup lang="ts">
import { ref } from 'vue';
import TransactionsTable from './TransactionsTable.vue';
import TransactionDetailsModal from './TransactionDetailsModal.vue';
import type { ITransaction, IBalanceAccountBase } from '../types';

const props = defineProps<{
    balanceAccount?: IBalanceAccountBase;
    loadingBalanceAccounts: boolean;
    currenciesSortedCurrencies: readonly string[];
    dataCustomization?: {
        list?: any;
        details?: any;
    };
    onContactSupport?: () => void;
    onRecordSelection?: (record: { id: string }) => void;
    showDetails?: boolean;
    // From useTransactionsList
    transactionsError?: Error;
    transactionsFetching: boolean;
    transactions: ITransaction[] | undefined;
    hasNext: boolean;
    hasPrevious: boolean;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    limit: number;
    limitOptions?: number[];
    updateLimit: (limit: number) => void;
    currentPage?: number;
}>();

const selectedDetail = ref<{
    selection: { data: string; type: string; balanceAccount?: IBalanceAccountBase };
    modalSize?: string;
} | null>(null);

function onRowClick(transaction: ITransaction) {
    // Analytics event would go here (stubbed)
    selectedDetail.value = {
        selection: {
            data: transaction.id,
            type: 'transaction',
            balanceAccount: props.balanceAccount,
        },
        modalSize: 'small',
    };

    props.onRecordSelection?.({ id: transaction.id });
}

function resetDetails() {
    selectedDetail.value = null;
}
</script>

<template>
    <TransactionDetailsModal
        :data-customization="props.dataCustomization"
        :on-contact-support="props.onContactSupport"
        :selected-detail="(props.showDetails ?? true) ? selectedDetail : null"
        :reset-details="resetDetails"
    />
    <TransactionsTable
        :active-balance-account="props.balanceAccount"
        :available-currencies="currenciesSortedCurrencies as string[]"
        :error="props.transactionsError"
        :has-multiple-currencies="props.currenciesSortedCurrencies.length > 1"
        :loading="props.loadingBalanceAccounts || props.transactionsFetching"
        :on-contact-support="props.onContactSupport"
        :on-row-click="onRowClick"
        :show-pagination="true"
        :transactions="props.transactions"
        :has-next="props.hasNext"
        :has-previous="props.hasPrevious"
        :go-to-next-page="props.goToNextPage"
        :go-to-previous-page="props.goToPreviousPage"
        :limit="props.limit"
        :limit-options="props.limitOptions"
        :update-limit="props.updateLimit"
        :current-page="props.currentPage"
    />
</template>
