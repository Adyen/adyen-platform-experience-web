<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoCard } from '@adyen/bento-vue3';
import BalanceItem from './BalanceItem.vue';
import { useCoreContext } from '../../../core/Context';
import { useMaxWidthsState } from '../composables/useMaxWidths';
import type { IBalance } from '../types';

type IBalanceWithKey = IBalance & {
    availableBalanceElemId?: string;
    reservedBalanceElemId?: string;
    key?: string;
};

const props = defineProps<{
    balances: readonly Readonly<IBalance>[];
    hiddenField?: 'available' | 'reserved';
    isLoading: boolean;
    fullWidth?: boolean;
    ariaLabel?: string;
}>();

const { i18n } = useCoreContext();
const { maxWidths, setMaxWidths } = useMaxWidthsState();
const isHovered = ref(false);

let _idCounter = 0;
function uniqueId(prefix = 'elem'): string {
    return `${prefix}-${++_idCounter}`;
}

const balancesWithKeys = computed<IBalanceWithKey[]>(() =>
    props.balances.map(b => ({
        ...b,
        key: b.currency,
        availableBalanceElemId: uniqueId('elem'),
        reservedBalanceElemId: uniqueId('elem'),
    }))
);

const firstBalance = computed(() => balancesWithKeys.value[0]);
const restOfBalances = computed(() => balancesWithKeys.value.slice(1));

const hasExpandableContent = computed(() => !props.isLoading && restOfBalances.value.length > 0);

const balancesListLabel = computed(() => {
    switch (props.hiddenField) {
        case 'available':
            return i18n.get('transactions.overview.balances.lists.reserved');
        case 'reserved':
            return i18n.get('transactions.overview.balances.lists.available');
        default:
            return i18n.get('transactions.overview.balances.lists.default');
    }
});
</script>

<template>
    <bento-card
        :expandable="hasExpandableContent"
        :closed="hasExpandableContent"
        :aria-label="props.ariaLabel"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @focus="isHovered = true"
        @blur="isHovered = false"
    >
        <div role="list" :aria-label="balancesListLabel">
            <div
                v-if="firstBalance || props.isLoading"
                role="listitem"
                :aria-label="firstBalance ? `${i18n.get('transactions.overview.balances.currency.label')}: ${firstBalance.currency}` : undefined"
                :aria-describedby="firstBalance ? `${firstBalance.availableBalanceElemId} ${firstBalance.reservedBalanceElemId}` : undefined"
            >
                <BalanceItem
                    :show-label-underline="isHovered"
                    :balance="firstBalance"
                    :hidden-field="props.hiddenField"
                    :widths="maxWidths"
                    :is-header="true"
                    :is-skeleton="props.isLoading"
                    :is-loading="props.isLoading"
                    :on-widths-set="setMaxWidths"
                    :available-balance-elem-id="firstBalance?.availableBalanceElemId"
                    :reserved-balance-elem-id="firstBalance?.reservedBalanceElemId"
                />
            </div>
        </div>

        <template v-if="hasExpandableContent" #content>
            <div
                v-for="balance in restOfBalances"
                :key="balance.key"
                role="listitem"
                :aria-label="`${i18n.get('transactions.overview.balances.currency.label')}: ${balance.currency}`"
                :aria-describedby="`${balance.availableBalanceElemId} ${balance.reservedBalanceElemId}`"
            >
                <BalanceItem
                    :show-label-underline="isHovered"
                    :balance="balance"
                    :hidden-field="props.hiddenField"
                    :widths="maxWidths"
                    :on-widths-set="setMaxWidths"
                    :available-balance-elem-id="balance.availableBalanceElemId"
                    :reserved-balance-elem-id="balance.reservedBalanceElemId"
                />
            </div>
        </template>
    </bento-card>
</template>
