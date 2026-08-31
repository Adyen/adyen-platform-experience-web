<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoTypography, BentoSegmentedControl } from '@adyen/bento-vue3';
import type { BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import type { IBalanceAccountBase } from '../../types';
import styles from './TransactionsOverview.module.scss';
import { useTransactionsContext } from '../../../integration/context';

defineProps<{
    hideTitle?: boolean;
    balanceAccounts?: IBalanceAccountBase[];
}>();

const { i18n } = useTransactionsContext();
const { transactionsViewState } = useTransactionsOverviewContext();
const { activeView, onViewChange, viewTabs } = transactionsViewState;

const bentoViewTabs = computed<BentoSegmentedControlItem[]>(() => viewTabs.value.map(tab => ({ value: tab.id, label: i18n.get(tab.label) })));
</script>

<template>
    <div>
        <div :class="styles.header">
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
