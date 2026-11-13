<script setup lang="ts">
import { DataOverviewError, type ErrorMessageInfo } from '@integration-components/composables-vue';

const errorInfo = {
    title: 'capital.common.emptyStates.noOffer.title',
    messages: ['capital.common.emptyStates.noOffer.message'],
} satisfies ErrorMessageInfo;
</script>

<template>
    <DataOverviewError :error-info="{ ...errorInfo }" type="highlight" />
</template>
