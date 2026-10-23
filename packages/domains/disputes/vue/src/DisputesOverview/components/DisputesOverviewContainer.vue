<script setup lang="ts">
import { computed } from 'vue';
import { ComponentShell, useBalanceAccounts, type ErrorMessageInfo } from '@integration-components/composables-vue';
import DisputesOverview from './DisputesOverview.vue';
import type { DisputesOverviewComponentProps } from '../types';

const props = defineProps<DisputesOverviewComponentProps>();
const { balanceAccounts, isFetching, error } = useBalanceAccounts();
const hasError = computed(() => !!error.value);

const errorInfo = computed<ErrorMessageInfo>(() => ({
    title: 'disputes.common.errors.somethingWentWrong',
    messages: ['disputes.overview.errors.unavailable'],
    onContactSupport: props.onContactSupport,
}));
</script>

<template>
    <div>
        <ComponentShell v-if="hasError" state="error" :error-info="errorInfo" />

        <DisputesOverview
            v-else
            :pagination="props.pagination"
            :on-contact-support="props.onContactSupport"
            :on-record-selection="props.onRecordSelection"
            :tabs="props.tabs"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
