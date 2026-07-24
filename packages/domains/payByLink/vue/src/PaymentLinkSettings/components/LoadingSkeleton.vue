<script setup lang="ts">
import { BASE_CLASS_NAME } from '../constants';

withDefaults(
    defineProps<{
        rowNumber: number;
    }>(),
    { rowNumber: 3 }
);

const SKELETON_ITEM_CLASS_NAME = `${BASE_CLASS_NAME}__skeleton-item`;

const CLASSNAMES = {
    skeleton: `${BASE_CLASS_NAME}__skeleton`,
    item: SKELETON_ITEM_CLASS_NAME,
    header: `${SKELETON_ITEM_CLASS_NAME}--header`,
    container: `${BASE_CLASS_NAME}__skeleton-container`,
    small: `${SKELETON_ITEM_CLASS_NAME}--small`,
    large: `${SKELETON_ITEM_CLASS_NAME}--large`,
};
</script>

<template>
    <div :class="CLASSNAMES.skeleton">
        <div :class="[CLASSNAMES.item, CLASSNAMES.header]"></div>
        <div v-for="index in rowNumber" :key="index" :class="CLASSNAMES.container">
            <div :class="[CLASSNAMES.item, CLASSNAMES.small]"></div>
            <div :class="[CLASSNAMES.item, CLASSNAMES.large]"></div>
        </div>
    </div>
</template>
