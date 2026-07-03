<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { BentoDropdown, BentoInputField } from '@adyen/bento-vue3';
import FieldWrapper from '../../../fields/FieldWrapper.vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useWizard } from '../../../../composables/wizardContext';
import { PAYMENT_LINK_CREATION_FIELD_LENGTHS } from '../../../../../../../domain/src';
import './ShopperPhoneField.scss';

const wizard = useWizard();
const { i18n, getCdnDataset } = useCoreContext();

const config = computed(() => wizard.getFieldConfig('telephoneNumber'));
const error = computed(() => wizard.getError('telephoneNumber'));

const phones = ref<Array<{ id: string; prefix: string }>>([]);
const isFetching = ref(true);

onMounted(async () => {
    try {
        if (getCdnDataset) {
            phones.value =
                (await getCdnDataset<Array<{ id: string; prefix: string }>>({ name: 'phonenumbers', extension: 'json', fallback: [] })) ?? [];
        }
    } finally {
        isFetching.value = false;
    }
});

const displayValue = computed(() => wizard.displayValues.value['telephoneNumber'] ?? '');
const currentValue = computed(() => (wizard.values.value['telephoneNumber'] as string | undefined) ?? '');

// Prefix and number are stored joined in the value (`+343002119220`) and separated by a space in the display value (`+34 3002119220`).
const parsedPhone = computed<readonly [string, string]>(() => {
    const source = displayValue.value || currentValue.value;
    if (!source) return ['', ''];
    const [code, ...rest] = source.split(' ');
    return [code ?? '', rest.join(' ')];
});

const phoneCode = computed(() => parsedPhone.value[0]);
const phoneNumber = computed(() => parsedPhone.value[1]);

// Seed the space-separated display value from a prefilled default value on first render.
watch(
    [displayValue, currentValue],
    ([display, current]) => {
        if (!display && current) {
            const [code, ...rest] = current.split(' ');
            const number = rest.join(' ');
            wizard.setValue('telephoneNumber', `${code}${number}`, `${code} ${number}`);
        }
    },
    { immediate: true }
);

// `id` (country code) is unique per entry, unlike `prefix` which several countries share (e.g. +61).
const phoneItems = computed(() => {
    return phones.value.map(({ id, prefix }) => ({ label: `${id} (${prefix})`, value: id })).sort((a, b) => a.label.localeCompare(b.label));
});

// Only the prefix is persisted in the field value, so when several countries share the same
// prefix (e.g. +1 for the US and Canada) we remember the explicitly selected country id instead
// of re-deriving it from the prefix, which would always resolve to the same (first-matching) country.
const selectedCountryId = ref('');

watch(
    [phones, phoneCode],
    ([phoneList, code]) => {
        if (!phoneList.length || !code) {
            selectedCountryId.value = '';
            return;
        }
        const current = phoneList.find(p => p.id === selectedCountryId.value);
        if (current?.prefix !== code) {
            selectedCountryId.value = phoneList.find(p => p.prefix === code)?.id ?? '';
        }
    },
    { immediate: true }
);

const shouldHide = computed(
    () => !isFetching.value && phones.value.length === 0 && !config.value.required && !displayValue.value && !currentValue.value
);

function onPrefixUpdate(value: string | number | { value?: string | number } | Array<unknown> | undefined) {
    if (Array.isArray(value)) return;
    const next = typeof value === 'object' && value !== null ? value.value : value;
    const countryId = next === undefined ? '' : String(next);
    selectedCountryId.value = countryId;
    const code = phones.value.find(p => p.id === countryId)?.prefix ?? '';
    const number = phoneNumber.value;
    wizard.setValue('telephoneNumber', `${code}${number}`, `${code} ${number}`);
}

function onNumberInput(value: string | number) {
    const number = String(value);
    const code = phoneCode.value;
    wizard.setValue('telephoneNumber', `${code}${number}`, `${code} ${number}`);
}
</script>

<template>
    <FieldWrapper v-if="config.visible && !shouldHide" name="telephoneNumber" :error="error">
        <div class="adyen-pe-payment-link-creation-form__phone-container">
            <BentoDropdown
                class="adyen-pe-payment-link-creation-form__phone-prefix"
                :items="phoneItems"
                :label="i18n.get('payByLink.creation.fields.shopperPhone.label')"
                :placeholder="i18n.get('payByLink.creation.fields.shopperPhone.phonePrefix.placeholder')"
                :model-value="selectedCountryId"
                dynamic-filtering
                :optional="!config.required"
                :readonly="isFetching || config.readOnly"
                :error="!!error"
                @update:model-value="onPrefixUpdate"
            />
            <BentoInputField
                class="adyen-pe-payment-link-creation-form__phone-number"
                label=" "
                type="text"
                :model-value="phoneNumber"
                :maxlength="PAYMENT_LINK_CREATION_FIELD_LENGTHS.telephoneNumber.max"
                :readonly="config.readOnly"
                :error="!!error"
                @input="onNumberInput"
            />
        </div>
    </FieldWrapper>
</template>
