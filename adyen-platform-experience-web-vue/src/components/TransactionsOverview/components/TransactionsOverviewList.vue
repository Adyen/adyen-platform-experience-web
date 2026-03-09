<script setup lang="ts">
import { useCoreContext } from '../../../core/Context';
import TransactionTotals from './TransactionTotals.vue';
import Balances from './Balances.vue';
import TransactionsList from './TransactionsList.vue';
import { classes } from '../constants';
import type { IBalanceAccountBase, ITransaction, ITransactionTotal, IBalance } from '../types';

const props = defineProps<{
    balanceAccount?: IBalanceAccountBase;
    balanceAccounts: IBalanceAccountBase[] | undefined;
    isLoadingBalanceAccount: boolean;
    onContactSupport?: () => void;
    onRecordSelection?: (record: { id: string }) => void;
    showDetails?: boolean;
    dataCustomization?: any;
    // Account balances
    balancesError?: Error;
    loadingBalances: boolean;
    sortedBalances: readonly Readonly<IBalance>[];
    balancesCanRefresh: boolean;
    balancesRefresh: () => void;
    // Transaction totals
    totalsError?: Error;
    loadingTotals: boolean;
    sortedTotals: readonly Readonly<ITransactionTotal>[];
    totalsCanRefresh: boolean;
    totalsRefresh: () => void;
    // Currencies
    currenciesSortedCurrencies: readonly string[];
    // Transactions list
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

const { i18n } = useCoreContext();
</script>

<template>
    <div>
        <div :class="classes.summary">
            <div :class="classes.summaryItem">
                <!-- Totals error or card -->
                <div v-if="props.totalsError" :class="classes.totalsError" class="adyen-pe-alert adyen-pe-alert--warning">
                    <p>{{ i18n.get('transactions.overview.totals.error') }}</p>
                    <button :disabled="!props.totalsCanRefresh" @click="props.totalsRefresh">
                        {{ i18n.get('common.actions.refresh.labels.default') }}
                    </button>
                </div>
                <TransactionTotals v-else :totals="props.sortedTotals" :loading-totals="props.loadingTotals" />
            </div>

            <div :class="classes.summaryItem">
                <!-- Balances error or card -->
                <div v-if="props.balancesError" :class="classes.totalsError" class="adyen-pe-alert adyen-pe-alert--warning">
                    <p>{{ i18n.get('transactions.overview.balances.error') }}</p>
                    <button :disabled="!props.balancesCanRefresh" @click="props.balancesRefresh">
                        {{ i18n.get('common.actions.refresh.labels.default') }}
                    </button>
                </div>
                <Balances v-else :balances="props.sortedBalances" :loading-balances="props.loadingBalances" />
            </div>
        </div>

        <TransactionsList
            :balance-account="props.balanceAccount"
            :currencies-sorted-currencies="props.currenciesSortedCurrencies"
            :loading-balance-accounts="props.isLoadingBalanceAccount || !props.balanceAccounts"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :show-details="props.showDetails"
            :transactions-error="props.transactionsError"
            :transactions-fetching="props.transactionsFetching"
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
    </div>
</template>
