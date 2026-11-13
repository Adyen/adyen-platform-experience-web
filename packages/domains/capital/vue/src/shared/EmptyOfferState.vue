<script setup lang="ts">
import { useCoreContext } from '@integration-components/core/vue';
import { EmptyState } from '@integration-components/composables-vue';

const { i18n } = useCoreContext();
</script>

<template>
    <EmptyState :title="i18n.get('capital.common.emptyStates.noOffer.title')" type="highlight">
        {{ i18n.get('capital.common.emptyStates.noOffer.message') }}
    </EmptyState>
</template>
