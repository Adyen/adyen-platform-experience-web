<script setup lang="ts">
import { BentoDropdown } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './BalanceAccountSelector.module.scss';

const props = defineProps<{
    options: { label: string; value: string; description?: string | undefined }[];
}>();

const selectedBalanceAccountId = defineModel<string | undefined>({ required: true });

const { i18n } = useCoreContext();

const onChange = (value: string | number | { value?: string | number } | Array<unknown> | undefined) => {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    if (nextValue !== undefined) selectedBalanceAccountId.value = String(nextValue);
};
</script>

<template>
    <div v-if="props.options.length > 1" :class="styles.root">
        <BentoDropdown
            :aria-label="i18n.get('cashOut.overview.balanceAccount.label')"
            :placeholder="i18n.get('cashOut.overview.balanceAccount.label')"
            :items="props.options"
            :model-value="selectedBalanceAccountId"
            @update:model-value="onChange"
        />
    </div>
</template>
