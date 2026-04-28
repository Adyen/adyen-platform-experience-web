<script setup lang="ts">
import { computed } from 'vue';
import ReportsOverview from './ReportsOverview.vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from '@integration-components/composables-vue';
import { CONTAINER_CLASS } from '../constants';

const props = withDefaults(
    defineProps<{
        balanceAccountId?: string;
        allowLimitSelection?: boolean;
        preferredLimit?: number;
        hideTitle?: boolean;
        onContactSupport?: () => void;
        onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
        dataCustomization?: any;
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
            <p>{{ i18n.get('reports.overview.errors.unavailable') }}</p>
            <button v-if="props.onContactSupport" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport') }}
            </button>
        </div>

        <!-- Main content -->
        <ReportsOverview
            v-else
            :balance-account-id="props.balanceAccountId"
            :allow-limit-selection="props.allowLimitSelection"
            :preferred-limit="props.preferredLimit"
            :hide-title="props.hideTitle"
            :on-contact-support="props.onContactSupport"
            :on-filters-changed="props.onFiltersChanged"
            :data-customization="props.dataCustomization"
            :balance-accounts="balanceAccounts"
            :is-loading-balance-account="isFetching"
        />
    </div>
</template>
