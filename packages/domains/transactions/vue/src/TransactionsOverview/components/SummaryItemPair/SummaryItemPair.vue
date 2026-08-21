<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { BentoTypography, BentoInfoIcon } from '@adyen/bento-vue3';
import styles from './SummaryItemPair.module.scss';

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

const text1Ref = ref<HTMLElement | null>(null);
const text2Ref = ref<HTMLElement | null>(null);

const measureWidths = () =>
    nextTick(() => {
        const w1 = text1Ref.value?.getBoundingClientRect().width ?? 0;
        const w2 = text2Ref.value?.getBoundingClientRect().width ?? 0;
        emit('widthsSet', [w1, w2]);
    });

onMounted(measureWidths);

watch(() => [props.value1, props.value2], measureWidths);

const getValueStyle = (index: number) => {
    const w = props.widths?.[index];
    return { whiteSpace: 'nowrap' as const, ...(w ? { width: `${w}px` } : {}) };
};
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.pair">
            <div class="adyen-pe-transactions-overview__summary-item--left">
                <div :class="styles.labelWrap">
                    <BentoTypography variant="caption">{{ label1 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip1" :tooltipText="tooltip1" />
                </div>
                <div :style="getValueStyle(0)">
                    <span ref="text1Ref" style="display: inline-block">
                        <BentoTypography variant="title">{{ value1 }}</BentoTypography>
                    </span>
                </div>
            </div>
        </div>
        <div :class="styles.pair">
            <div class="adyen-pe-transactions-overview__summary-item--right">
                <div :class="styles.labelWrap">
                    <BentoTypography variant="caption">{{ label2 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip2" :tooltipText="tooltip2" />
                </div>
                <div :style="getValueStyle(1)">
                    <span ref="text2Ref" style="display: inline-block">
                        <BentoTypography variant="title">{{ value2 }}</BentoTypography>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
