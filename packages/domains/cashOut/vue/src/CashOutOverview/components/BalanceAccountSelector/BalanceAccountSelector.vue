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
    <!-- Always rendered: the account count is unknown until balance accounts load, so the selector's space is reserved
         up front (and stays empty for a single account) to keep the component's size fixed. -->
    <div :class="styles.root">
        <BentoDropdown
            v-if="props.options.length > 1"
            :aria-label="i18n.get('cashOut.overview.balanceAccount.label')"
            :placeholder="i18n.get('cashOut.overview.balanceAccount.label')"
            :items="props.options"
            :model-value="selectedBalanceAccountId"
            @update:model-value="onChange"
        />
    </div>
</template>
