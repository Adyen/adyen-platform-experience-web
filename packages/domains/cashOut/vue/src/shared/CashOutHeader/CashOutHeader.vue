<script setup lang="ts">
import { BentoHeader } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import BalanceAccountSelector from '../BalanceAccountSelector/BalanceAccountSelector.vue';
import styles from './CashOutHeader.module.scss';

const props = defineProps<{
    balanceAccountOptions: { label: string; value: string; description?: string | undefined }[];
    hideTitle?: boolean;
    titleKey: TranslationKey;
}>();

const selectedBalanceAccountId = defineModel<string | undefined>('selectedBalanceAccountId', { required: true });

const { i18n } = useCoreContext();
</script>

<template>
    <div v-if="!props.hideTitle" :class="styles.root">
        <BentoHeader variant="component" :title="i18n.get(props.titleKey)" />
        <BalanceAccountSelector v-model="selectedBalanceAccountId" :options="props.balanceAccountOptions" />
    </div>
    <!-- Outside the component shell so another balance account can still be selected when one fails to load. -->
    <BalanceAccountSelector v-else v-model="selectedBalanceAccountId" :options="props.balanceAccountOptions" />
</template>
