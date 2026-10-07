<script setup lang="ts">
import { computed } from 'vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import TransactionsOverview from '../TransactionsOverview/TransactionsOverview.vue';
import type { TransactionsOverviewExternalProps } from '../../types';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        onContactSupport?: () => void;
        onRecordSelection?: TransactionsOverviewExternalProps['onRecordSelection'];
        dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    }>(),
    {}
);

const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);

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
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
