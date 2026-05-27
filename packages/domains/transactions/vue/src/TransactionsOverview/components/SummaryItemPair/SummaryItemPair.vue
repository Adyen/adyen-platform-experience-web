<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { BentoTypography, BentoInfoIcon } from '@adyen/bento-vue3';
import './SummaryItemPair.scss';

const props = defineProps<{
    label1: string;
    value1: string;
    tooltip1?: string;
    label2: string;
    value2: string;
    tooltip2?: string;
    widths?: number[];
}>();

const emit = defineEmits<{
    widthsSet: [widths: number[]];
}>();

const value1Ref = ref<HTMLElement | null>(null);
const value2Ref = ref<HTMLElement | null>(null);

onMounted(() =>
    nextTick(() => {
        const w1 = value1Ref.value?.getBoundingClientRect().width ?? 0;
        const w2 = value2Ref.value?.getBoundingClientRect().width ?? 0;
        emit('widthsSet', [w1, w2]);
    })
);

const getValueStyle = (index: number) => {
    const w = props.widths?.[index];
    return { whiteSpace: 'nowrap' as const, ...(w ? { width: `${w}px` } : {}) };
};
</script>

<template>
    <div class="adyen-pe-transactions-overview__summary-item">
        <div class="adyen-pe-transactions-overview__summary-item__pair">
            <div class="adyen-pe-transactions-overview__summary-item--left">
                <div class="adyen-pe-transactions-overview__summary-item__label-wrap">
                    <BentoTypography variant="caption">{{ label1 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip1" :tooltipText="tooltip1" />
                </div>
                <div ref="value1Ref" :style="getValueStyle(0)">
                    <BentoTypography variant="title">{{ value1 }}</BentoTypography>
                </div>
            </div>
        </div>
        <div class="adyen-pe-transactions-overview__summary-item__pair">
            <div class="adyen-pe-transactions-overview__summary-item--right">
                <div class="adyen-pe-transactions-overview__summary-item__label-wrap">
                    <BentoTypography variant="caption">{{ label2 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip2" :tooltipText="tooltip2" />
                </div>
                <div ref="value2Ref" :style="getValueStyle(1)">
                    <BentoTypography variant="title">{{ value2 }}</BentoTypography>
                </div>
            </div>
        </div>
    </div>
</template>
