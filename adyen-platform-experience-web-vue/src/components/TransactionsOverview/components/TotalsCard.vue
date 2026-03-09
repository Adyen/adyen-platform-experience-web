<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoCard } from '@adyen/bento-vue3';
import TransactionTotalItem from './TransactionTotalItem.vue';
import { useCoreContext } from '../../../core/Context';
import { useMaxWidthsState } from '../composables/useMaxWidths';
import type { ITransactionTotal } from '../types';

type ITransactionTotalWithKey = ITransactionTotal &
    Partial<{
        expensesElemId: string;
        incomingsElemId: string;
        key: string;
    }>;

const props = defineProps<{
    totals: readonly Readonly<ITransactionTotal>[];
    hiddenField?: 'incomings' | 'expenses';
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

const totalsWithKeys = computed<ITransactionTotalWithKey[]>(() =>
    props.totals.map(t => ({
        ...t,
        key: t.currency,
        expensesElemId: uniqueId('elem'),
        incomingsElemId: uniqueId('elem'),
    }))
);

const firstTotal = computed(() => totalsWithKeys.value[0]);
const restOfTotals = computed(() => totalsWithKeys.value.slice(1));

const hasExpandableContent = computed(() => !props.isLoading && restOfTotals.value.length > 0);

const totalsListLabel = computed(() => {
    switch (props.hiddenField) {
        case 'expenses':
            return i18n.get('transactions.overview.totals.lists.incoming');
        case 'incomings':
            return i18n.get('transactions.overview.totals.lists.outgoing');
        default:
            return i18n.get('transactions.overview.totals.lists.default');
    }
});
</script>

<template>
    <bento-card
        :expandable="hasExpandableContent"
        closed
        :aria-label="props.ariaLabel"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @focus="isHovered = true"
        @blur="isHovered = false"
    >
        <div role="list" :aria-label="totalsListLabel">
            <div
                v-if="firstTotal || props.isLoading"
                role="listitem"
                :aria-label="firstTotal ? `${i18n.get('transactions.overview.totals.currency.label')}: ${firstTotal.currency}` : undefined"
                :aria-describedby="firstTotal ? `${firstTotal.incomingsElemId} ${firstTotal.expensesElemId}` : undefined"
            >
                <TransactionTotalItem
                    :show-label-underline="isHovered"
                    :total="firstTotal"
                    :hidden-field="props.hiddenField"
                    :widths="maxWidths"
                    :is-header="true"
                    :is-skeleton="props.isLoading"
                    :is-loading="props.isLoading"
                    :on-widths-set="setMaxWidths"
                    :expenses-elem-id="firstTotal?.expensesElemId"
                    :incomings-elem-id="firstTotal?.incomingsElemId"
                />
            </div>
        </div>

        <template v-if="hasExpandableContent" #content>
            <div
                v-for="total in restOfTotals"
                :key="total.key"
                role="listitem"
                :aria-label="`${i18n.get('transactions.overview.totals.currency.label')}: ${total.currency}`"
                :aria-describedby="`${total.incomingsElemId} ${total.expensesElemId}`"
            >
                <TransactionTotalItem
                    :show-label-underline="isHovered"
                    :total="total"
                    :hidden-field="props.hiddenField"
                    :widths="maxWidths"
                    :on-widths-set="setMaxWidths"
                    :expenses-elem-id="total.expensesElemId"
                    :incomings-elem-id="total.incomingsElemId"
                />
            </div>
        </template>
    </bento-card>
</template>
