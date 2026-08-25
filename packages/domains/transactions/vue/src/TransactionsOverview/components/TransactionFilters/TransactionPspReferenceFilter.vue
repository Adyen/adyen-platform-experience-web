<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoBaseFilter, BentoInputField, useBentoBaseFilter } from '@adyen/bento-vue3';
import styles from './TransactionPspReferenceFilter.module.scss';

const PSP_REFERENCE_LENGTH = 16;

interface PspReferenceFilterOptions {
    placeholder?: string;
}

interface PspReferenceFilterProps {
    disabled?: boolean;
    defaultValue?: string;
    field: string;
    label: string;
    onlySlot?: boolean;
    options?: PspReferenceFilterOptions;
    value?: string;
}

const props = withDefaults(defineProps<PspReferenceFilterProps>(), {
    defaultValue: undefined,
    options: undefined,
    value: undefined,
});

const emit = defineEmits<{
    input: [updatedProps: PspReferenceFilterProps];
    update: [updatedProps: PspReferenceFilterProps];
}>();

const { i18n } = useCoreContext();
const { internalFilterValue, isApplyButtonDisabled, clearFilter, openFilter, resetFilter } = useBentoBaseFilter(
    toRef(props, 'value'),
    toRef(props, 'defaultValue')
);

const hasInvalidInput = ref(false);
const hasInvalidLength = computed(() => !!internalFilterValue.value && internalFilterValue.value.length < PSP_REFERENCE_LENGTH);
const invalidLengthError = computed(() =>
    i18n.get('transactions.overview.filters.types.paymentPspReference.errors.invalidLength', {
        values: { length: PSP_REFERENCE_LENGTH },
    })
);
const isApplyDisabled = computed(() => isApplyButtonDisabled.value || hasInvalidLength.value);
const isSecondaryButtonDisabled = computed(() => {
    if (hasInvalidLength.value) return !props.value;
    return !internalFilterValue.value || (!props.value && !hasInvalidInput.value);
});
const buttonSecondaryLabel = computed(() => props.value?.slice(0, 12));

function normalizeValue(value: string | number) {
    return String(value)
        .replace(/[^a-z\d]/gi, '')
        .slice(0, PSP_REFERENCE_LENGTH)
        .toUpperCase();
}

function onInput(value: string | number) {
    internalFilterValue.value = normalizeValue(value) || undefined;
    hasInvalidInput.value ||= hasInvalidLength.value;
    emit('input', { ...props, value: internalFilterValue.value });
}

function onOpen() {
    hasInvalidInput.value = false;
    openFilter();
}

function updateFilter(value = internalFilterValue.value) {
    if (hasInvalidLength.value) return;
    emit('input', { ...props, value });
    emit('update', { ...props, value });
}
</script>

<template>
    <BentoBaseFilter
        :label="props.label"
        :field="props.field"
        :disabled="props.disabled"
        :only-slot="props.onlySlot"
        :button-secondary-label="buttonSecondaryLabel"
        :disable-apply-button="isApplyDisabled"
        :disable-secondary-button="isSecondaryButtonDisabled"
        @apply="updateFilter()"
        @clear="clearFilter(updateFilter)"
        @open="onOpen"
        @reset="resetFilter(updateFilter)"
    >
        <div :class="styles.root">
            <BentoInputField
                :model-value="internalFilterValue"
                :disabled="props.disabled"
                :placeholder="props.options?.placeholder"
                :error-message="hasInvalidLength ? invalidLengthError : undefined"
                :maxlength="PSP_REFERENCE_LENGTH"
                @update:model-value="onInput"
            />
        </div>
    </BentoBaseFilter>
</template>
