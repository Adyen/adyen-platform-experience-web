<script setup lang="ts">
import { computed } from 'vue';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
import EmptyState from './EmptyState/EmptyState.vue';
import { useCoreContext } from '@integration-components/core/vue';

const props = defineProps<{
    onDismiss?: () => void;
}>();

const { i18n } = useCoreContext();
const actions = computed<BentoButtonActionsList | undefined>(() =>
    props.onDismiss ? [{ title: i18n.get('capital.common.actions.goBack'), event: props.onDismiss }] : undefined
);
</script>

<template>
    <EmptyState :title="i18n.get('capital.offer.common.noOfferTitle')" type="highlight" :actions="actions">
        {{ i18n.get('capital.offer.common.noOfferDescription') }}
    </EmptyState>
</template>
