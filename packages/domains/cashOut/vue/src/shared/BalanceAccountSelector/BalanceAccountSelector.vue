<script setup lang="ts">
import { BentoDropdown } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getDropdownValue } from '../utils/getDropdownValue';
import styles from './BalanceAccountSelector.module.scss';

const props = defineProps<{
    options: { label: string; value: string; description?: string | undefined }[];
}>();

const selectedBalanceAccountId = defineModel<string | undefined>({ required: true });

const { i18n } = useCoreContext();

const onChange = (value: Parameters<typeof getDropdownValue>[0]) => {
    const nextValue = getDropdownValue(value);
    if (nextValue !== undefined) selectedBalanceAccountId.value = nextValue;
};
</script>

<template>
    <div v-if="props.options.length > 1" :class="styles.root">
        <BentoDropdown
            :aria-label="i18n.get('cashOut.common.balanceAccount.label')"
            :placeholder="i18n.get('cashOut.common.balanceAccount.label')"
            :items="props.options"
            :model-value="selectedBalanceAccountId"
            @update:model-value="onChange"
        />
    </div>
</template>
