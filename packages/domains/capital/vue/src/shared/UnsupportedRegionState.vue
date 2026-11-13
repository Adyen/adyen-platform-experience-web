<script setup lang="ts">
import { DataOverviewError, type ErrorMessageInfo } from '@integration-components/composables-vue';

const errorInfo = {
    title: 'capital.common.emptyStates.unsupportedRegion.title',
    messages: ['capital.common.emptyStates.unsupportedRegion.message'],
} satisfies ErrorMessageInfo;
</script>

<template>
    <DataOverviewError :error-info="errorInfo" type="highlight" />
</template>
