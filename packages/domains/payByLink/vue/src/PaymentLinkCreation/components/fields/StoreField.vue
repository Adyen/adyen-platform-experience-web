<script setup lang="ts">
import { computed } from 'vue';
import FieldWrapper from './FieldWrapper.vue';
import StoreDropdown, { type StoreOption } from '../../../shared/components/StoreDropdown.vue';
import { getStoreDropdownDisplayValue } from '../../../shared/utils/storeDropdown';
import { useWizard } from '../../composables/wizardContext';
import type { PaymentLinkFieldName } from '../../../../../domain/src';

const props = defineProps<{
    name: PaymentLinkFieldName;
    label: string;
    items: StoreOption[];
    placeholder?: string;
    filterable?: boolean;
    disabled?: boolean;
}>();

const wizard = useWizard();
const config = computed(() => wizard.getFieldConfig(props.name));
const error = computed(() => wizard.getError(props.name));
const modelValue = computed(() => (wizard.values.value[props.name] as string | undefined) ?? '');

function onUpdate(value: string, selectedStore?: StoreOption) {
    const storeCode = selectedStore?.storeCode || selectedStore?.name || value;
    const displayName = getStoreDropdownDisplayValue(storeCode, selectedStore?.description);
    wizard.setValue(props.name, value, displayName);
}
</script>

<template>
    <FieldWrapper v-if="config.visible" :name="props.name">
        <StoreDropdown
            :items="props.items"
            :label="props.label"
            :placeholder="props.placeholder ?? props.label"
            :model-value="modelValue"
            :optional="!config.required"
            :readonly="config.readOnly"
            :disabled="props.disabled"
            :dynamic-filtering="props.filterable"
            :error-message="error"
            @update:model-value="onUpdate"
        />
    </FieldWrapper>
</template>
