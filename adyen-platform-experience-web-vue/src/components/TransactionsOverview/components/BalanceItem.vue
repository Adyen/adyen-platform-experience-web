<script setup lang="ts">
import { computed } from 'vue';
import SummaryItem from './SummaryItem.vue';
import type { SummaryItemColumnConfig } from './SummaryItem.vue';
import { useCoreContext } from '../../../core/Context';
import type { IBalance } from '../types';

const props = defineProps<{
    balance?: Readonly<IBalance>;
    hiddenField?: 'available' | 'reserved';
    isHeader?: boolean;
    showLabelUnderline?: boolean;
    isSkeleton?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    availableBalanceElemId?: string;
    reservedBalanceElemId?: string;
}>();

const { i18n } = useCoreContext();

const columnConfigs = computed<SummaryItemColumnConfig[]>(() => {
    const availableBalanceConfig: SummaryItemColumnConfig = {
        elemId: props.availableBalanceElemId,
        labelKey: 'transactions.overview.balances.tags.available',
        skeletonWidth: 80,
        getValue: () => props.balance ? i18n.amount(props.balance.value, props.balance.currency) : undefined,
        get ariaLabel(): string {
            return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
        },
    };

    const reservedBalanceConfig: SummaryItemColumnConfig = {
        elemId: props.reservedBalanceElemId,
        labelKey: 'transactions.overview.balances.tags.reserved',
        skeletonWidth: 80,
        getValue: () => props.balance ? i18n.amount(props.balance.reservedValue, props.balance.currency) : undefined,
        tooltipLabel: 'transactions.overview.balances.tags.reserved.description',
        get ariaLabel(): string {
            return `${i18n.get(this.labelKey!)}: ${this.getValue()}`;
        },
    };

    return [
        ...(props.hiddenField !== 'available' ? [availableBalanceConfig] : []),
        ...(props.hiddenField !== 'reserved' ? [reservedBalanceConfig] : []),
        {
            skeletonWidth: 40,
            valueHasLabelStyle: true,
            getValue: () => props.balance?.currency,
        },
    ];
});
</script>

<template>
    <SummaryItem
        :show-label-underline="props.showLabelUnderline"
        :is-empty="!props.balance"
        :column-configs="columnConfigs"
        :is-header="props.isHeader"
        :is-skeleton-visible="props.isSkeleton"
        :is-loading="props.isLoading"
        :widths="props.widths"
        :on-widths-set="props.onWidthsSet"
    />
</template>
