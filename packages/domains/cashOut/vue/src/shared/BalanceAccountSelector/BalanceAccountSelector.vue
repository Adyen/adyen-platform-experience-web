<script setup lang="ts">
import { ref, watch } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getDropdownValue } from '../utils/getDropdownValue';
import styles from './BalanceAccountSelector.module.scss';

const props = defineProps<{
    options: { label: string; value: string; description?: string | undefined }[];
    disabled?: boolean;
}>();

const selectedBalanceAccountId = defineModel<string | undefined>({ required: true });

const emit = defineEmits<{ close: [] }>();

const root = ref<HTMLElement>();

// Bento's dropdown tells when its list opens but not when it closes, so that comes from its combobox, whose aria-expanded tells
// whether the list is open.
watch(
    root,
    (element, _, onCleanup) => {
        const combobox = element?.querySelector('[role="combobox"]');
        if (!combobox) return;

        let isOpen = combobox.getAttribute('aria-expanded') === 'true';
        const observer = new MutationObserver(() => {
            const wasOpen = isOpen;
            isOpen = combobox.getAttribute('aria-expanded') === 'true';
            if (wasOpen && !isOpen) emit('close');
        });
        observer.observe(combobox, { attributes: true, attributeFilter: ['aria-expanded'] });
        onCleanup(() => observer.disconnect());
    },
    { flush: 'post' }
);

const { i18n } = useCoreContext();

const onChange = (value: Parameters<typeof getDropdownValue>[0]) => {
    if (props.disabled) return;
    const nextValue = getDropdownValue(value);
    if (nextValue !== undefined) selectedBalanceAccountId.value = nextValue;
};
</script>

<template>
    <div v-if="props.options.length > 1" ref="root" :class="styles.root">
        <BentoDropdown
            :aria-label="i18n.get('cashOut.common.balanceAccount.label')"
            :placeholder="i18n.get('cashOut.common.balanceAccount.label')"
            :items="props.options"
            :model-value="selectedBalanceAccountId"
            :disabled="props.disabled"
            @update:model-value="onChange"
        />
    </div>
</template>
