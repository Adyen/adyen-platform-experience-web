<script setup lang="ts">
import { computed } from 'vue';
import TransactionsOverview from './TransactionsOverview.vue';
import { useBalanceAccounts } from '../composables/useBalanceAccounts';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        onRecordSelection?: (record: { id: string }) => void;
        showDetails?: boolean;
        hideTitle?: boolean;
        onContactSupport?: () => void;
        onFiltersChanged?: (...args: any[]) => void;
        dataCustomization?: any;
    }>(),
    {
        showDetails: true,
    }
);

const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);

const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);
</script>

<template>
    <div class="adyen-pe-transactions-overview-container">
        <!-- Error state -->
        <div v-if="hasError" class="adyen-pe-data-overview-error">
            <p>{{ 'Unable to load transactions overview' }}</p>
            <button v-if="props.onContactSupport" @click="props.onContactSupport">Contact Support</button>
        </div>

        <!-- Main content -->
        <TransactionsOverview
            v-else
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :on-record-selection="props.onRecordSelection"
            :show-details="props.showDetails"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :on-filters-changed="props.onFiltersChanged"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
