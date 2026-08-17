<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoDropdown, BentoInputField } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useWizard } from '../../../../composables/wizardContext';
import { FLEXIBLE_VALIDITY_ID, LINK_VALIDITY_DURATION_UNITS } from '../../../../../../../domain/src';
import type { IPaymentLinkValidity } from '@integration-components/types';
import type { TranslationKey } from '@integration-components/core';
import './ValidityField.scss';

const props = defineProps<{
    options?: IPaymentLinkValidity[];
}>();

const wizard = useWizard();
const { i18n } = wizard;
const config = computed(() => wizard.getFieldConfig('linkValidity.durationUnit'));
const required = computed(() => config.value.required || wizard.getFieldConfig('linkValidity.quantity').required);
const error = computed(() => wizard.getError('linkValidity.quantity'));

const presetItems = computed(() =>
    (props.options ?? []).map(({ quantity, durationUnit, type }) => {
        if (type === FLEXIBLE_VALIDITY_ID) {
            return { label: i18n.get('payByLink.creation.fields.validity.linkValidityUnit.custom'), value: FLEXIBLE_VALIDITY_ID };
        }
        const key = `payByLink.creation.fields.validity.linkValidityUnit.${durationUnit}` as TranslationKey;
        return { label: i18n.get(key, { values: { quantity }, count: quantity }), value: `${quantity} ${durationUnit}` };
    })
);

const unitItems = computed(() =>
    LINK_VALIDITY_DURATION_UNITS.map(unit => ({
        label: i18n.get(`payByLink.creation.fields.validity.linkValidityUnit.${unit}__plural` as TranslationKey),
        value: unit,
    }))
);

const selection = ref('');
const quantity = computed(() => (wizard.values.value['linkValidity.quantity'] as string | number | undefined) ?? '');
const unit = computed(() => (wizard.values.value['linkValidity.durationUnit'] as string | undefined) ?? '');

function resolveSelection() {
    const q = wizard.getValue('linkValidity.quantity');
    const u = wizard.getValue('linkValidity.durationUnit');
    if (!q || !u) return presetItems.value[0]?.value ?? '';
    const match = presetItems.value.find(item => item.value === `${q} ${u}`);
    return match ? match.value : FLEXIBLE_VALIDITY_ID;
}

watch(
    presetItems,
    items => {
        if (!items.length) return;
        const q = wizard.getValue('linkValidity.quantity');
        const u = wizard.getValue('linkValidity.durationUnit');
        if (!q || !u) {
            const [firstQty, firstUnit] = `${items[0]?.value}`.split(' ');
            if (firstQty && firstUnit && items[0]?.value !== FLEXIBLE_VALIDITY_ID) {
                wizard.setValue('linkValidity.quantity', firstQty);
                wizard.setValue('linkValidity.durationUnit', firstUnit);
            }
        }
        selection.value = resolveSelection();
    },
    { immediate: true }
);

function onPresetUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    if (next === undefined) return;
    const stringValue = String(next);
    selection.value = stringValue;
    if (stringValue !== FLEXIBLE_VALIDITY_ID) {
        const [qty, durationUnit] = stringValue.split(' ');
        wizard.setValue('linkValidity.quantity', qty);
        wizard.setValue('linkValidity.durationUnit', durationUnit);
    } else {
        wizard.setValue('linkValidity.quantity', '');
        wizard.setValue('linkValidity.durationUnit', '');
    }
}

function onQuantityInput(value: string | number) {
    wizard.setValue('linkValidity.quantity', value);
}

function onUnitUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    if (next === undefined) return;
    wizard.setValue('linkValidity.durationUnit', String(next));
}
</script>

<template>
    <div v-if="config.visible" class="adyen-pe-payment-link-creation-form__validity-container">
        <FieldWrapper name="linkValidity.durationUnit">
            <BentoDropdown
                :items="presetItems"
                :label="i18n.get('payByLink.creation.fields.validity.label')"
                :description="i18n.get('payByLink.creation.fields.validity.supportText')"
                :placeholder="i18n.get('common.inputs.select.placeholder')"
                :model-value="selection"
                :optional="!required"
                :readonly="config.readOnly"
                @update:model-value="onPresetUpdate"
            />
        </FieldWrapper>
        <FieldWrapper v-if="selection === FLEXIBLE_VALIDITY_ID" name="linkValidity.quantity" :error="error">
            <div class="adyen-pe-payment-link-creation-form__validity-custom">
                <BentoInputField
                    :label="i18n.get('payByLink.creation.fields.validity.customDuration.label')"
                    type="number"
                    :model-value="quantity"
                    :min="1"
                    :readonly="config.readOnly"
                    :error="!!error"
                    @input="onQuantityInput"
                />
                <BentoDropdown
                    :items="unitItems"
                    :placeholder="i18n.get('common.inputs.select.placeholder')"
                    :model-value="unit"
                    :readonly="config.readOnly"
                    :error="!!error"
                    @update:model-value="onUnitUpdate"
                />
            </div>
        </FieldWrapper>
    </div>
</template>
