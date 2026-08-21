<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoModal } from '@adyen/bento-vue3';
import TransactionsOverviewShell from './TransactionsOverviewShell.vue';
import TransactionsOverviewList from '../TransactionsList/TransactionsOverviewList.vue';
import TransactionsOverviewInsights from './TransactionsOverviewInsights.vue';
import TransactionDetailsContainer from '../../../TransactionDetails/components/TransactionDetailsContainer.vue';
import { useTransactionsOverviewState } from '../../composables/useTransactionsOverviewState';
import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_DETAILS } from '@integration-components/transactions/domain';
import type { ITransaction } from '@integration-components/types';
import type { TransactionsOverviewExternalProps, IBalanceAccountBase } from '../../types';
import TransactionsFilters from '../TransactionFilters/TransactionsFilters.vue';
import TransactionsExport from '../TransactionsExport/TransactionsExport.vue';
import styles from './TransactionsOverview.module.scss';

const props = defineProps<{
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    hideInsights?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: TransactionsOverviewExternalProps['onRecordSelection'];
    dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    balanceAccounts?: IBalanceAccountBase[];
    isLoadingBalanceAccount?: boolean;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const state = useTransactionsOverviewState(() => props as any);

const isModalOpen = ref(false);
const selectedTransactionId = ref<string | null>(null);

function showModal() {
    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
    selectedTransactionId.value = null;
}

function onRowClick(transaction: ITransaction) {
    selectedTransactionId.value = transaction.id;

    if (transaction.category) {
        userEvents.addEvent?.('Viewed transaction details', {
            category: TRANSACTION_ANALYTICS_CATEGORY,
            subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_DETAILS,
            transactionType: transaction.category,
        });
    }

    if (props.onRecordSelection) {
        props.onRecordSelection({
            id: transaction.id,
            showModal,
        });
    } else if (props.showDetails !== false) {
        showModal();
    }
}

const showExport = computed(() => state.isTransactionsView.value);
const canExport = computed(() => state.transactionsListResult.records.value.length || state.transactionsListResult.hasPrevious.value);
</script>

<template>
    <TransactionsOverviewShell :hide-title="props.hideTitle">
        <div role="toolbar" :class="styles.toolbar">
            <TransactionsFilters :balance-accounts="props.balanceAccounts" />
            <TransactionsExport v-if="showExport" :disabled="!canExport" />
        </div>
        <TransactionsOverviewList
            v-if="state.isTransactionsView.value"
            :balance-accounts="props.balanceAccounts"
            :is-loading-balance-account="props.isLoadingBalanceAccount ?? false"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :show-details="props.showDetails"
            :data-customization="props.dataCustomization"
            :on-row-click="onRowClick"
        />
        <TransactionsOverviewInsights v-else />
    </TransactionsOverviewShell>

    <BentoModal
        :is-open="isModalOpen"
        size="medium"
        :is-dismissible="true"
        @close-modal="closeModal"
        :aria-label="i18n.get('transactions.details.title')"
    >
        <!-- Empty header needed for no padding -->
        <span />
        <template #content>
            <TransactionDetailsContainer
                v-if="selectedTransactionId"
                :id="selectedTransactionId"
                :data-customization="props.dataCustomization"
                :on-contact-support="props.onContactSupport"
                hide-title
                within-modal
            />
        </template>
    </BentoModal>
</template>
