<script setup lang="ts">
import { computed } from 'vue';
import PayoutsOverview from './PayoutsOverview.vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from '@integration-components/composables-vue';
import { CONTAINER_CLASS } from '../constants';
import type { PayoutsOverviewExternalProps } from '../types';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        hideTitle?: boolean;
        showDetails?: boolean;
        onContactSupport?: () => void;
        onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
        onRecordSelection?: PayoutsOverviewExternalProps['onRecordSelection'];
        dataCustomization?: PayoutsOverviewExternalProps['dataCustomization'];
    }>(),
    {}
);

const { i18n } = useCoreContext();

const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(() => props.balanceAccountId);
const hasError = computed(() => !!error.value || isBalanceAccountIdWrong.value);
</script>

<template>
    <div :class="CONTAINER_CLASS">
        <!-- Error state -->
        <div v-if="hasError" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('payouts.overview.errors.unavailable') }}</p>
            <button v-if="props.onContactSupport" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </button>
        </div>

        <!-- Main content -->
        <PayoutsOverview
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
