<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTypography, BentoSegmentedControl, BentoCard } from '@adyen/bento-vue3';
import type { BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import { BASE_CLASS } from '../../constants';
import type { IBalanceAccountBase } from '../../types';
import './TransactionsOverview.scss';

defineProps<{
    hideTitle?: boolean;
    balanceAccounts?: IBalanceAccountBase[];
}>();

const { i18n } = useCoreContext();
const { transactionsViewState } = useTransactionsOverviewContext();
const { activeView, onViewChange, viewTabs } = transactionsViewState;

const bentoViewTabs = computed<BentoSegmentedControlItem[]>(() => viewTabs.value.map(tab => ({ value: tab.id, label: i18n.get(tab.label) })));
</script>

<template>
    <div :class="BASE_CLASS">
        <div class="adyen-pe-transactions-overview-header">
            <BentoTypography v-if="!hideTitle" variant="title">{{ i18n.get('transactions.overview.title') }}</BentoTypography>
            <!-- Empty div for space between -->
            <div v-else />
            <BentoSegmentedControl
                v-if="viewTabs.length > 1"
                :aria-label="i18n.get('transactions.overview.viewSelect.a11y.label')"
                :items="bentoViewTabs"
                :model-value="activeView"
                @update:model-value="onViewChange"
            />
        </div>
        <BentoCard>
            <template #content>
                <slot />
            </template>
        </BentoCard>
    </div>
</template>
