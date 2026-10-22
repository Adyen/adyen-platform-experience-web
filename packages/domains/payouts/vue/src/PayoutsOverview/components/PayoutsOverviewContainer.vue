<script setup lang="ts">
import { computed } from 'vue';
import PayoutsOverview from './PayoutsOverview.vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import type { PayoutsOverviewComponentProps } from '../types';

const props = defineProps<PayoutsOverviewComponentProps>();
const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);

const errorInfo = computed<ErrorMessageInfo>(() => ({
    title: 'payouts.common.errors.somethingWentWrong',
    messages: ['payouts.overview.errors.unavailable'],
    onContactSupport: props.onContactSupport,
}));
</script>

<template>
    <div>
        <ComponentShell v-if="hasError" state="error" :error-info="errorInfo" />

        <!-- Main content -->
        <PayoutsOverview
            v-else
            :balance-account-id="props.balanceAccountId"
            :pagination="props.pagination"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
