<script setup lang="ts">
import AmountSkeleton from './AmountSkeleton.vue';
import SummaryItemLabel from './SummaryItemLabel.vue';
import { useCoreContext } from '../../../core/Context';

export interface SummaryItemColumnConfig {
    elemId?: string;
    labelKey?: string;
    ref?: any;
    skeletonWidth?: number;
    hasSkeletonMargin?: boolean;
    getValue: () => string | undefined;
    tooltipLabel?: string;
    valueHasLabelStyle?: boolean;
    ariaLabel?: string;
}

const props = defineProps<{
    columnConfigs: SummaryItemColumnConfig[];
    isHeader?: boolean;
    showLabelUnderline?: boolean;
    isSkeletonVisible?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    isEmpty?: boolean;
}>();

const { i18n } = useCoreContext();

const BASE_CLASS = 'adyen-pe-summary-item';
const BODY_CLASS = `${BASE_CLASS}--body`;
const LABEL_CLASS = `${BASE_CLASS}__label-value`;
const AMOUNT_CLASS = `${BASE_CLASS}__amount`;
const PLACEHOLDER_CLASS = `${BASE_CLASS}__placeholder`;

function getColumnStyle(index: number) {
    return { width: props.widths && props.widths[index] ? `${props.widths[index]}px` : 'auto' };
}
</script>

<template>
    <div :class="[BASE_CLASS, { [BODY_CLASS]: !props.isHeader }]">
        <div v-for="(config, index) in props.columnConfigs" :key="index">
            <div v-if="props.isHeader" role="presentation">
                <!-- TODO: Add Tooltip wrapper when tooltipLabel is present -->
                <SummaryItemLabel :label-key="config.labelKey" :i18n="i18n" :is-skeleton-visible="props.isSkeletonVisible" />
            </div>

            <AmountSkeleton
                v-if="props.isSkeletonVisible"
                :is-loading="props.isLoading"
                :has-margin="config.hasSkeletonMargin"
                :width="config.skeletonWidth + 'px'"
            />
            <span v-else-if="props.isEmpty" :class="[BASE_CLASS, PLACEHOLDER_CLASS]" />
            <div v-else :id="config.elemId" :style="getColumnStyle(index)" :aria-label="config.ariaLabel" role="presentation">
                <span :class="{ [LABEL_CLASS]: config.valueHasLabelStyle, [AMOUNT_CLASS]: !config.valueHasLabelStyle }">
                    {{ config.getValue() }}
                </span>
            </div>
        </div>
    </div>
</template>
