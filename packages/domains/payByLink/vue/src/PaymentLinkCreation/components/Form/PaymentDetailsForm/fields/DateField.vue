<script setup lang="ts">
import { computed, watch } from 'vue';
import { BentoDatePicker } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
}>();

const wizard = useWizard();
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const rawValue = computed(() => wizard.values.value[props.name] as string | undefined);

function parseDate(value: string | undefined) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

const modelValue = computed(() => {
    return parseDate(rawValue.value);
});

watch(
    rawValue,
    value => {
        if (value && !parseDate(value)) wizard.setValue(props.name, '');
    },
    { immediate: true }
);

function onUpdate(value: Date | null) {
    wizard.setValue(props.name, value ? value.toISOString() : '');
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name" :error="error">
        <BentoDatePicker
            :label="props.label"
            :model-value="modelValue"
            :readonly="config.readOnly"
            :optional="!config.required"
            :error-message="error"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
