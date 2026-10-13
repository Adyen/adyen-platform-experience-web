<script setup lang="ts">
import { computed } from 'vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import DisputesOverview from './DisputesOverview.vue';
import type { DisputesOverviewProps } from '../types';

const props = defineProps<DisputesOverviewProps>();

const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);

const errorInfo = computed<ErrorMessageInfo>(() => ({
    title: 'disputes.common.errors.somethingWentWrong',
    messages: ['disputes.overview.common.errors.unavailable'],
    onContactSupport: props.onContactSupport,
}));
</script>

<template>
    <div>
        <ComponentShell v-if="hasError" state="error" :error-info="errorInfo" />

        <DisputesOverview
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
