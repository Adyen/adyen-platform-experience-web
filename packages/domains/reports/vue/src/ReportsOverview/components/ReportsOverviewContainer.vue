<script setup lang="ts">
import { computed } from 'vue';
import ReportsOverview from './ReportsOverview.vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import type { ReportsOverviewComponentProps } from '../types';

const props = defineProps<ReportsOverviewComponentProps>();
const { balanceAccounts, isFetching, error } = useBalanceAccounts();
const hasError = computed(() => !!error.value);

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
            :pagination="props.pagination"
            :on-contact-support="props.onContactSupport"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
