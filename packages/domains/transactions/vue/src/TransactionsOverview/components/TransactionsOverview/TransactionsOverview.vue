<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoLoadingIndicator, BentoModal, BentoToast } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { DataOverviewError, getDataOverviewErrorInfo, getErrorMessage, useDataOverviewError } from '@integration-components/composables-vue';
import TransactionsOverviewShell from './TransactionsOverviewShell.vue';
import TransactionsOverviewList from '../TransactionsList/TransactionsOverviewList.vue';
import TransactionsOverviewInsights from './TransactionsOverviewInsights.vue';
import TransactionDetailsContainer from '../../../TransactionDetails/components/TransactionDetailsContainer.vue';
import { useTransactionsOverviewState } from '../../composables/useTransactionsOverviewState';
import type { ITransaction } from '@integration-components/types';
import type { TransactionsOverviewProps } from '../../types';
import TransactionsFilters from '../TransactionFilters/TransactionsFilters.vue';
import TransactionsExport from '../TransactionsExport/TransactionsExport.vue';
import styles from './TransactionsOverview.module.scss';
import '@adyen/bento-vue3/styles/bento-light';
import { useTransactionsContext } from '../../../integration/context';
import {
    TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS,
    TRANSACTIONS_DATA_OVERVIEW_ERROR_KEYS,
    TRANSACTIONS_ERROR_MESSAGE_KEYS,
} from '../../../integration/translationKeys';
import {
    transactionsOverviewEventBridge,
    type TransactionDetailsEventMap,
    type TransactionsOverviewEmits,
    type TransactionsOverviewEventMap,
} from '../../../events';

const props = defineProps<Omit<TransactionsOverviewProps, 'onFiltersChanged'> & { hideInsights?: boolean }>();
const emit = defineEmits<TransactionsOverviewEmits>();
const hasContactSupportListener = transactionsOverviewEventBridge.hasListener('contactSupportRequested');
const hasTransactionSelectedListener = transactionsOverviewEventBridge.hasListener('transactionSelected');
transactionsOverviewEventBridge.provideEvents({
    contactSupportRequested: payload => emit('contactSupportRequested', payload),
    detailsLoaded: payload => emit('detailsLoaded', payload),
    exportCancelled: payload => emit('exportCancelled', payload),
    exportCompleted: payload => emit('exportCompleted', payload),
    exportOpened: payload => emit('exportOpened', payload),
    filterChanged: payload => emit('filterChanged', payload),
    filtersChanged: payload => emit('filtersChanged', payload),
    navigationRequested: payload => emit('navigationRequested', payload),
    refundCancelled: payload => emit('refundCancelled', payload),
    refundCompleted: payload => emit('refundCompleted', payload),
    refundViewOpened: payload => emit('refundViewOpened', payload),
    transactionSelected: payload => emit('transactionSelected', payload),
    valueCopied: payload => emit('valueCopied', payload),
    viewDurationRecorded: payload => emit('viewDurationRecorded', payload),
    viewEntered: payload => emit('viewEntered', payload),
});

const { balanceAccounts, i18n, provideTranslationOverrides, runtime } = useTransactionsContext();
provideTranslationOverrides();
const available = computed(() => runtime.available);
const filteredBalanceAccounts = computed(() => {
    const accounts = balanceAccounts.accounts;
    if (!props.balanceAccountId) return accounts;
    const account = accounts?.find(candidate => candidate.id === props.balanceAccountId);
    return account ? [account] : [];
});
const isBalanceAccountIdWrong = computed(
    () => !!props.balanceAccountId && !!balanceAccounts.accounts?.length && filteredBalanceAccounts.value?.length === 0
);
const overviewErrorInfo = computed(() =>
    getDataOverviewErrorInfo({
        balanceAccountsError: balanceAccounts.error,
        errorMessage: 'transactions.overview.errors.unavailable',
        errorKeys: TRANSACTIONS_ERROR_MESSAGE_KEYS,
        hasError: available.value === false,
        isBalanceAccountIdWrong: isBalanceAccountIdWrong.value,
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
        overviewErrorKeys: TRANSACTIONS_DATA_OVERVIEW_ERROR_KEYS,
    })
);
const hasOverviewError = computed(() => !!overviewErrorInfo.value);

const state = useTransactionsOverviewState(() => ({
    allowLimitSelection: props.allowLimitSelection,
    balanceAccounts: filteredBalanceAccounts.value,
    balanceAccountId: props.balanceAccountId,
    dataCustomization: props.dataCustomization,
    fetchEnabled: available.value === true && !hasOverviewError.value && !runtime.refreshing,
    hideInsights: props.hideInsights,
    onFiltersChanged,
    preferredLimit: props.preferredLimit,
}));
const listError = computed(() => state.transactionsListResult.error.value as Error | undefined);
const listErrorInfo = computed(() =>
    getErrorMessage({
        error: listError.value,
        keys: TRANSACTIONS_ERROR_MESSAGE_KEYS,
        message: 'transactions.overview.errors.listUnavailable',
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
    })
);
const activeErrorInfo = computed(() => overviewErrorInfo.value ?? listErrorInfo.value);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: TRANSACTIONS_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo: activeErrorInfo,
    onRefresh: () => runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const tableErrorPresentation = computed(() => (listError.value ? errorPresentation.value : undefined));

const isModalOpen = ref(false);
const selectedTransactionId = ref<string | null>(null);

function showModal() {
    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
    selectedTransactionId.value = null;
}

function requestContactSupport() {
    const payload: TransactionsOverviewEventMap['contactSupportRequested'] = { component: 'overview' };
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}

function onFiltersChanged(payload: TransactionsOverviewEventMap['filtersChanged']) {
    emit('filtersChanged', payload);
}

function onRowClick(transaction: ITransaction) {
    if (props.showDetails === false && !props.onRecordSelection && !hasTransactionSelectedListener.value) return;
    selectedTransactionId.value = transaction.id;

    const payload: TransactionsOverviewEventMap['transactionSelected'] = {
        category: transaction.category,
        id: transaction.id,
        showModal,
    };
    emit('transactionSelected', payload);

    if (props.onRecordSelection) {
        props.onRecordSelection(payload);
    } else if (props.showDetails !== false) {
        showModal();
    }
}

function onDetailsContactSupportRequested(payload: TransactionDetailsEventMap['contactSupportRequested']) {
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}

const showExport = computed(() => state.isTransactionsView.value);
const canExport = computed(() => state.transactionsListResult.records.value.length || state.transactionsListResult.hasPrevious.value);
</script>

<template>
    <BentoLoadingIndicator v-if="available === undefined" />

    <DataOverviewError v-else-if="hasOverviewError" v-bind="errorPresentation" />

    <template v-else>
        <TransactionsOverviewShell :hide-title="props.hideTitle">
            <div role="toolbar" :class="styles.toolbar">
                <TransactionsFilters :balance-accounts="filteredBalanceAccounts" />
                <TransactionsExport v-if="showExport" :disabled="!canExport" />
            </div>
            <TransactionsOverviewList
                v-if="state.isTransactionsView.value"
                :balance-accounts="filteredBalanceAccounts"
                :is-loading-balance-account="balanceAccounts.loading"
                :error-presentation="tableErrorPresentation"
                :on-row-click="onRowClick"
            />
            <TransactionsOverviewInsights v-else />
        </TransactionsOverviewShell>

        <BentoModal
            size="medium"
            :is-open="isModalOpen"
            :is-dismissible="true"
            :aria-label="i18n.get('transactions.details.title')"
            @close-modal="closeModal"
        >
            <!-- Keep this default slot empty, needed for no padding. -->
            <template #default />
            <template #content>
                <TransactionDetailsContainer
                    v-if="selectedTransactionId"
                    :id="selectedTransactionId"
                    :data-customization="props.dataCustomization"
                    :show-contact-support="!!props.onContactSupport || hasContactSupportListener"
                    render-mode="modal"
                    @contact-support-requested="onDetailsContactSupportRequested"
                    @details-loaded="payload => emit('detailsLoaded', payload)"
                    @navigation-requested="payload => emit('navigationRequested', payload)"
                    @refund-cancelled="payload => emit('refundCancelled', payload)"
                    @refund-completed="payload => emit('refundCompleted', payload)"
                    @refund-view-opened="payload => emit('refundViewOpened', payload)"
                    @value-copied="payload => emit('valueCopied', payload)"
                />
            </template>
        </BentoModal>

        <BentoToast />
    </template>
</template>
