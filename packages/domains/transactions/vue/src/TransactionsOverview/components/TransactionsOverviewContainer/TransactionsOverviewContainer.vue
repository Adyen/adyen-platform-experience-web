<script setup lang="ts">
import { computed } from 'vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import TransactionsOverview from '../TransactionsOverview/TransactionsOverview.vue';
import type { TransactionsOverviewComponentProps } from '../../types';

const props = defineProps<TransactionsOverviewComponentProps>();

const { balanceAccounts, isFetching, error } = useBalanceAccounts();
const hasError = computed(() => !!error.value);

const errorInfo = computed<ErrorMessageInfo>(() => ({
    title: 'transactions.common.errors.somethingWentWrong',
    messages: ['transactions.overview.errors.unavailable'],
    onContactSupport: props.onContactSupport,
}));
</script>

<template>
    <div>
        <ComponentShell v-if="hasError" state="error" :error-info="errorInfo" />

        <TransactionsOverview
            v-else
            :pagination="props.pagination"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
