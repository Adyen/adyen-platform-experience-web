<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    items: { id: string; name: string }[];
    loading?: boolean;
    copyTo?: PaymentLinkFieldName;
    copyEnabled?: boolean;
    hideOptionalLabel?: boolean;
}>();

const wizard = useWizard();
const { i18n } = wizard;
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | undefined) ?? '');
const dropdownItems = computed(() => props.items.map(item => ({ label: item.name, value: item.id })));

watch(
    [() => props.items, () => props.loading, () => config.value.visible],
    ([items, loading, visible]) => {
        if (visible && !loading && items.length === 1 && items[0] && !modelValue.value) {
            onUpdate(items[0].id);
        }
    },
    { immediate: true }
);

function onUpdate(value: string | number | { value?: string | number } | Array<unknown> | null | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    const stringValue = next == null ? '' : String(next);
    const displayName = props.items.find(item => item.id === stringValue)?.name ?? stringValue;
    wizard.setValue(props.name, stringValue, displayName);
    if (props.copyEnabled && props.copyTo) wizard.setValue(props.copyTo, stringValue, displayName);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name">
        <BentoDropdown
            :items="dropdownItems"
            :label="props.label"
            :placeholder="i18n.get('payByLink.creation.select')"
            :model-value="modelValue"
            dynamic-filtering
            :optional="!config.required && !props.hideOptionalLabel"
            :clearable="!config.required"
            :readonly="config.readOnly || props.loading"
            :error-message="error"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
