<script setup lang="ts">
import EmptyState from './EmptyState/EmptyState.vue';
import { useCoreContext } from '@integration-components/core/vue';

const { i18n } = useCoreContext();
</script>

<template>
    <EmptyState :title="i18n.get('capital.common.errors.unsupportedRegion.title')" type="highlight">
        {{ i18n.get('capital.common.errors.unsupportedRegion') }}
    </EmptyState>
</template>
