<script setup lang="ts">
import { computed } from 'vue';
import ReportsOverview from './ReportsOverview.vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        onContactSupport?: () => void;
        dataCustomization?: any;
    }>(),
    {}
);

const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);

const errorInfo = computed<ErrorMessageInfo>(() => ({
    title: 'reports.common.errors.somethingWentWrong',
    messages: ['reports.overview.errors.unavailable'],
    onContactSupport: props.onContactSupport,
}));
</script>

<template>
    <div>
        <ComponentShell v-if="hasError" state="error" :error-info="errorInfo" />

        <!-- Main content -->
        <ReportsOverview
            v-else
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :on-contact-support="props.onContactSupport"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
