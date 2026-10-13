<script setup lang="ts">
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { CapitalOfferProps } from '../types';
import CapitalOffer from './CapitalOffer.vue';

const props = defineProps<Omit<CapitalOfferProps, 'hideTitle'>>();
const hideTitles = useShouldHideTitles();
</script>

<template>
    <CapitalOffer v-bind="props" :hide-title="hideTitles" />
</template>
