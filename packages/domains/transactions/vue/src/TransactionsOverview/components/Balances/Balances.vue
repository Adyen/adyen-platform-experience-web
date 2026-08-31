<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMaxWidths } from '../../composables/useMaxWidths';
import { BentoCard, BentoLoadingIndicator, BentoDivider, useClickOutside } from '@adyen/bento-vue3';
import type { IBalance } from '@integration-components/types';
import BalanceItem from './BalanceItem.vue';
import styles from '../TransactionsOverview/TransactionsOverview.module.scss';
import { useTransactionsContext } from '../../../integration/context';
import { formatAmountWithCurrencyCode } from '../../../integration/format';

const props = defineProps<{
    balances: readonly Readonly<IBalance>[];
    loadingBalances: boolean;
}>();

const { i18n } = useTransactionsContext();

const availableBalances = computed(() =>
    props.balances.map(b => ({
        ...b,
        formattedAvailable: formatAmountWithCurrencyCode(i18n, b.value, b.currency),
        formattedReserved: formatAmountWithCurrencyCode(i18n, b.reservedValue, b.currency),
    }))
);

const open = ref(false);
const cardRef = ref<HTMLElement | null>(null);

const updateToggleState = () => {
    open.value = !open.value;
};

useClickOutside(cardRef, () => {
    open.value = false;
});

const { maxWidths, updateMaxWidths } = useMaxWidths();
</script>

<template>
    <!-- BentoCard evaluates slot presence on mount; re-keying forces re-creation 
      when the number of currencies changes so the #content slot is correctly detected -->
    <BentoCard
        ref="cardRef"
        :key="availableBalances.length > 1 ? 'multi' : 'single'"
        :closed="!open"
        v-if="availableBalances.length > 0 || loadingBalances"
        @click="updateToggleState"
        :clickable="availableBalances.length > 1"
        :expandable="availableBalances.length > 1"
    >
        <template #header>
            <div :class="[styles.summaryHeader, styles.summaryGroup]">
                <BentoLoadingIndicator v-if="loadingBalances" />
                <BalanceItem
                    v-else-if="availableBalances[0]"
                    :currency="availableBalances[0].currency"
                    :formatted-available="availableBalances[0].formattedAvailable"
                    :formatted-reserved="availableBalances[0].formattedReserved"
                    is-header
                    :widths="maxWidths"
                    @widths-set="updateMaxWidths"
                />
            </div>
        </template>
        <template #content v-if="availableBalances.length > 1">
            <div :class="styles.summaryGroup">
                <div v-if="loadingBalances">
                    <BentoLoadingIndicator />
                </div>
                <BentoDivider />
                <div :class="styles.expandedList">
                    <BalanceItem
                        v-for="balance in availableBalances.slice(1)"
                        :key="balance.currency"
                        :formatted-available="balance.formattedAvailable"
                        :formatted-reserved="balance.formattedReserved"
                        :widths="maxWidths"
                        @widths-set="updateMaxWidths"
                    />
                </div>
            </div>
        </template>
    </BentoCard>
</template>
