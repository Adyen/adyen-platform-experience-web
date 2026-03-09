<script setup lang="ts">
import { useCoreContext } from '../../../core/Context';
import BalancesCard from './BalancesCard.vue';
import type { IBalance } from '../types';

const props = defineProps<{
    balances: readonly Readonly<IBalance>[];
    loadingBalances: boolean;
}>();

const { i18n } = useCoreContext();

const BASE_CLASS = 'adyen-pe-balances';
</script>

<template>
    <div :class="BASE_CLASS">
        <!-- TODO: Add responsive container logic for xs breakpoint -->
        <BalancesCard
            :aria-label="i18n.get('transactions.overview.balances.labels.default')"
            :balances="props.balances"
            :is-loading="props.loadingBalances"
        />
    </div>
</template>
