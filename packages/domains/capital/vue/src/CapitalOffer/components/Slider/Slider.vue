<script setup lang="ts">
import { computed } from 'vue';
import { calculateProgress } from './utils';
import styles from './Slider.module.scss';

const props = withDefaults(
    defineProps<{
        max?: number;
        min?: number;
        step?: number;
        value?: number;
    }>(),
    {
        max: 100,
        min: 0,
        step: 1,
        value: undefined,
    }
);

const value = computed(() => props.value ?? props.min);
const progress = computed(() => calculateProgress(value.value, props.min, props.max, props.step));
</script>

<template>
    <input
        v-bind="$attrs"
        :class="styles.root"
        :max="props.max"
        :min="props.min"
        :step="props.step"
        :style="{ backgroundSize: `${progress}% 100%` }"
        :value="value"
        type="range"
    />
</template>
