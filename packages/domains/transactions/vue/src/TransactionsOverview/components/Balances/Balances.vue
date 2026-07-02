<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMaxWidths } from '../../composables/useMaxWidths';
import { useCoreContext } from '@integration-components/core/vue';
import { formatAmountWithCurrencyCode } from '@integration-components/core/Localization/amount/amount-util';
import { BentoCard, BentoLoadingIndicator, BentoDivider, useClickOutside } from '@adyen/bento-vue3';
import type { IBalance } from '@integration-components/types';
import BalanceItem from './BalanceItem.vue';

const props = defineProps<{
    balances: readonly Readonly<IBalance>[];
    loadingBalances: boolean;
}>();

const { i18n } = useCoreContext();

const availableBalances = computed(() =>
    props.balances.map(b => ({
        ...b,
        formattedAvailable: formatAmountWithCurrencyCode(b.value, i18n.locale, b.currency),
        formattedReserved: formatAmountWithCurrencyCode(b.reservedValue, i18n.locale, b.currency),
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
        class="adyen-pe-balances adyen-pe-transactions-overview__summary-card"
        @click="updateToggleState"
        :clickable="availableBalances.length > 1"
        :expandable="availableBalances.length > 1"
    >
        <template #header>
            <div class="adyen-pe-balances__header adyen-pe-transactions-overview__summary-group">
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
            <div class="adyen-pe-transactions-overview__summary-group">
                <div v-if="loadingBalances" class="adyen-pe-balances__loading">
                    <BentoLoadingIndicator />
                </div>
                <BentoDivider />
                <div class="adyen-pe-balances__expanded-list">
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
