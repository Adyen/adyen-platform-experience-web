<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoInputFieldPhoneNumber } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useWizard } from '../../../../composables/wizardContext';

const wizard = useWizard();
const { i18n } = useCoreContext();

const config = computed(() => wizard.getFieldConfig('telephoneNumber'));
const error = computed(() => wizard.getError('telephoneNumber'));
const value = computed(() => (wizard.values.value['telephoneNumber'] as string | undefined) ?? '');

// Bento infers the country from the (E.164) value and keeps it in sync through `update:selected-country`.
const selectedCountry = ref<string | null>(null);

// Prefilled values may contain separators (`+34 612345678`), while the field emits the compact E.164 form.
if (/\s/.test(value.value)) wizard.setValue('telephoneNumber', value.value.replace(/\s/g, ''));

function onInput(next: string | number) {
    wizard.setValue('telephoneNumber', String(next));
}
</script>

<template>
    <FieldWrapper v-if="config.visible" name="telephoneNumber">
        <BentoInputFieldPhoneNumber
            v-model:selected-country="selectedCountry"
            :label="i18n.get('payByLink.creation.fields.shopperPhone.label')"
            :optional="!config.required"
            :model-value="value"
            :readonly="config.readOnly"
            :error-message="error"
            @update:model-value="onInput"
        />
    </FieldWrapper>
</template>
