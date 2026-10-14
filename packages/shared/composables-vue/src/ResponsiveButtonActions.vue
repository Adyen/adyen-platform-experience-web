<script setup lang="ts">
import { BentoButtonActions, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { containerQueries, useResponsiveContainer } from './useResponsiveContainer';
import styles from './ResponsiveButtonActions.module.scss';

const props = defineProps<{
    actions: BentoButtonActionsList;
}>();

const isMobile = useResponsiveContainer(containerQueries.down.xs);
</script>

<template>
    <BentoButtonActions
        :actions="props.actions"
        :layout="isMobile ? 'stacked-buttons' : 'space-between'"
        :class="[styles.actions, isMobile ? styles.actionsStacked : undefined]"
    />
</template>
