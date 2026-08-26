<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from '@integration-components/composables-vue';
import { BentoButton } from '@adyen/bento-vue3';
import TransactionsOverview from '../TransactionsOverview/TransactionsOverview.vue';
import type { TransactionsOverviewExternalProps } from '../../types';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        hideTitle?: boolean;
        showDetails?: boolean;
        onContactSupport?: () => void;
        onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
        onRecordSelection?: TransactionsOverviewExternalProps['onRecordSelection'];
        dataCustomization?: TransactionsOverviewExternalProps['dataCustomization'];
    }>(),
    {}
);

const { i18n } = useCoreContext();
const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);
</script>

<template>
    <div>
        <div v-if="hasError" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('transactions.overview.errors.unavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>
        <TransactionsOverview
            v-else
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :hide-title="props.hideTitle"
            :show-details="props.showDetails"
            :on-contact-support="props.onContactSupport"
            :on-filters-changed="props.onFiltersChanged"
            :on-record-selection="props.onRecordSelection"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
