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
    return w ? { width: `${w}px` } : {};
};
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.pair">
            <div>
                <div :class="styles.labelWrap">
                    <BentoTypography variant="body">{{ label1 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip1" :tooltipText="tooltip1" />
                    <span v-else aria-hidden="true" :class="styles.tooltipPlaceholder" />
                </div>
                <div :class="styles.itemValueContainer" :style="getValueStyle(0)">
                    <span ref="text1Ref" :class="styles.itemValue">
                        <BentoTypography variant="title" medium>{{ value1 }}</BentoTypography>
                    </span>
                </div>
            </div>
        </div>
        <div :class="styles.pair">
            <div>
                <div :class="styles.labelWrap">
                    <BentoTypography variant="body">{{ label2 }}</BentoTypography>
                    <BentoInfoIcon v-if="tooltip2" :tooltipText="tooltip2" />
                    <span v-else aria-hidden="true" :class="styles.tooltipPlaceholder" />
                </div>
                <div :class="styles.itemValueContainer" :style="getValueStyle(1)">
                    <span ref="text2Ref" :class="styles.itemValue">
                        <BentoTypography variant="title" medium>{{ value2 }}</BentoTypography>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
