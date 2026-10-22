<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { containerQueries, useResponsiveContainer, useShouldHideTitles } from '@integration-components/composables-vue';
import { BentoTypography, BentoSegmentedControl } from '@adyen/bento-vue3';
import type { BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { useTransactionsOverviewContext } from '../../composables/useTransactionsOverviewState';
import type { IBalanceAccountBase } from '../../types';
import styles from './TransactionsOverview.module.scss';

defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
}>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();
const isMobile = useResponsiveContainer(containerQueries.down.xs);
const { transactionsViewState } = useTransactionsOverviewContext();
const { activeView, onViewChange, viewTabs } = transactionsViewState;

const bentoViewTabs = computed<BentoSegmentedControlItem[]>(() => viewTabs.value.map(tab => ({ value: tab.id, label: i18n.get(tab.label) })));
</script>

<template>
    <div>
        <div :class="[styles.header, isMobile ? styles.headerMobile : '']">
            <BentoTypography v-if="!hideTitles" variant="title">
                {{ i18n.get('transactions.overview.title') }}
            </BentoTypography>
            <!-- Empty div for space between -->
            <div v-else-if="!isMobile" />
            <BentoSegmentedControl
                v-if="viewTabs.length > 1"
                :aria-label="i18n.get('transactions.overview.viewSelect.a11y.label')"
                :full-width="isMobile"
                :items="bentoViewTabs"
                :model-value="activeView"
                @update:model-value="onViewChange"
            />
        </div>
        <slot />
    </div>
</template>
