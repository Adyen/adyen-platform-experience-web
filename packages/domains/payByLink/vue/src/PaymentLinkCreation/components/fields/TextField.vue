<script setup lang="ts">
import { computed } from 'vue';
import { BentoInputField } from '@adyen/bento-vue3';
import FieldWrapper from './FieldWrapper.vue';
import { useWizard } from '../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    type?: 'text' | 'number';
    maxlength?: number;
    supportText?: string;
}>();

const wizard = useWizard();
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | number | undefined) ?? '');

function onInput(value: string | number) {
    wizard.setValue(props.name, value);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name" :error="error">
        <BentoInputField
            :label="props.label"
            :type="props.type ?? 'text'"
            :model-value="modelValue"
            :readonly="config.readOnly"
            :optional="!config.required"
            :error="!!error"
            :maxlength="props.maxlength"
            :description="props.supportText"
            @input="onInput"
        />
    </FieldWrapper>
</template>
