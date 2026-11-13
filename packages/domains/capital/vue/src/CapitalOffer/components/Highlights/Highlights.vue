<script setup lang="ts">
import { BentoCard, BentoTypography } from '@adyen/bento-vue3';
import styles from './Highlights.module.scss';

defineProps<{
    items: {
        align?: 'start' | 'center';
        label?: string;
        value: string;
    }[];
}>();
</script>

<template>
    <BentoCard background="secondary">
        <template #content>
            <div :class="styles.content">
                <div
                    v-for="item in items"
                    :key="item.label ?? item.value"
                    :class="[styles.item, item.align === 'center' ? styles.itemCenter : undefined]"
                >
                    <BentoTypography v-if="item.label" variant="caption" :class="styles.label">
                        {{ item.label }}
                    </BentoTypography>
                    <BentoTypography variant="body" strongest>
                        {{ item.value }}
                    </BentoTypography>
                </div>
            </div>
        </template>
    </BentoCard>
</template>
