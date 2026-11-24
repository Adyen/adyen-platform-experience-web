<script setup lang="ts">
import { ref } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useBentoDropdown } from '../composables/useBentoDropdown';
import { getDropdownValue } from '../utils/getDropdownValue';
import { isSearchable } from '../utils/isSearchable';
import styles from './BalanceAccountSelector.module.scss';

const props = defineProps<{
    options: { label: string; value: string; description?: string | undefined }[];
    disabled?: boolean;
}>();

const selectedBalanceAccountId = defineModel<string | undefined>({ required: true });

const emit = defineEmits<{ close: [] }>();

const root = ref<HTMLElement>();
// Tells when the list of balance accounts closes, and keeps the selector as it is while they are searched.
const { showSelectedFromStart } = useBentoDropdown(root, { onClose: () => emit('close') });

const { i18n } = useCoreContext();

const onChange = (value: Parameters<typeof getDropdownValue>[0]) => {
    if (props.disabled) return;
    const nextValue = getDropdownValue(value);
    if (nextValue === undefined) return;
    selectedBalanceAccountId.value = nextValue;
    if (isSearchable(props.options)) void showSelectedFromStart();
};
</script>

<template>
    <div v-if="props.options.length > 1" ref="root" :class="styles.root" data-testid="balance-account-selector">
        <BentoDropdown
            :aria-label="i18n.get('cashOut.common.balanceAccount.label')"
            :placeholder="i18n.get('cashOut.common.balanceAccount.label')"
            :items="props.options"
            :model-value="selectedBalanceAccountId"
            :disabled="props.disabled"
            :dynamic-filtering="isSearchable(props.options)"
            @update:model-value="onChange"
        />
    </div>
</template>
