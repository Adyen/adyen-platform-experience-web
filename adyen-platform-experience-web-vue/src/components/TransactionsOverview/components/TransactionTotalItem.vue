<script setup lang="ts">
import { computed } from 'vue';
import SummaryItem from './SummaryItem.vue';
import type { SummaryItemColumnConfig } from './SummaryItem.vue';
import { useCoreContext } from '../../../core/Context';
import type { ITransactionTotal } from '../types';

const props = defineProps<{
    total?: Readonly<ITransactionTotal>;
    hiddenField?: 'incomings' | 'expenses';
    isHeader?: boolean;
    showLabelUnderline?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    expensesElemId?: string;
    incomingsElemId?: string;
}>();

const { i18n } = useCoreContext();

const columnConfigs = computed<SummaryItemColumnConfig[]>(() => {
    const incomingsConfig: SummaryItemColumnConfig = {
        elemId: props.incomingsElemId,
        labelKey: 'transactions.overview.totals.tags.incoming',
        skeletonWidth: 80,
        getValue: () => props.total ? i18n.amount(props.total.incomings, props.total.currency) : undefined,
        tooltipLabel: 'transactions.overview.totals.tags.incoming.description',
        get ariaLabel(): string {
            return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
        },
    };

    const expensesConfig: SummaryItemColumnConfig = {
        elemId: props.expensesElemId,
        labelKey: 'transactions.overview.totals.tags.outgoing',
        skeletonWidth: 80,
        getValue: () => props.total ? i18n.amount(props.total.expenses, props.total.currency) : undefined,
        tooltipLabel: 'transactions.overview.totals.tags.outgoing.description',
        get ariaLabel(): string {
            return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
        },
    };

    return [
        ...(props.hiddenField !== 'incomings' ? [incomingsConfig] : []),
        ...(props.hiddenField !== 'expenses' ? [expensesConfig] : []),
        {
            skeletonWidth: 40,
            valueHasLabelStyle: true,
            getValue: () => props.total?.currency,
        },
    ];
});
</script>

<template>
    <SummaryItem
        :show-label-underline="props.showLabelUnderline"
        :is-empty="!props.total"
        :column-configs="columnConfigs"
        :is-header="props.isHeader"
        :is-skeleton-visible="props.isSkeleton"
        :is-loading="props.isLoading"
        :widths="props.widths"
        :on-widths-set="props.onWidthsSet"
    />
</template>
