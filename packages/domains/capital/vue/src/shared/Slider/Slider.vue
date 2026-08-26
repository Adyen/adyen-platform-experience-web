<script setup lang="ts">
import { computed } from 'vue';
import { calculateProgress } from './calculateProgress';
import './Slider.scss';

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

const emit = defineEmits<{
    change: [event: Event];
}>();

const value = computed(() => props.value ?? props.min);
const progress = computed(() => calculateProgress(value.value, props.min, props.max, props.step));
</script>

<template>
    <input
        v-bind="$attrs"
        :max="props.max"
        :min="props.min"
        :step="props.step"
        :style="{ backgroundSize: `${progress}% 100%` }"
        :value="value"
        class="adyen-pe-slider"
        type="range"
        @input="event => emit('change', event)"
    />
</template>
