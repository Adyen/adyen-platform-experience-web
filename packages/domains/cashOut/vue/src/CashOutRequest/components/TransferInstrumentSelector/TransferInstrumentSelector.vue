<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutTransferInstrument, ICashOutTransferInstrumentIneligibilityReason } from '@integration-components/types';

const INELIGIBILITY_REASON_MESSAGES = {
    noInstantTransferRoute: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute',
    sendToTransferInstrumentNotAllowed: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.sendToTransferInstrumentNotAllowed',
    transferInstrumentCurrencyMismatch: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch',
} as const satisfies Record<ICashOutTransferInstrumentIneligibilityReason, TranslationKey>;

const props = defineProps<{
    disabled?: boolean;
    transferInstruments: ICashOutTransferInstrument[];
}>();

const selectedTransferInstrumentId = defineModel<string | undefined>({ required: true });

const { i18n } = useCoreContext();

// Ineligible accounts stay listed, disabled, with the reason they can't receive the cashOut.
const options = computed(() =>
    props.transferInstruments.map(({ description, eligible, ineligibilityReasons: [reason], transferInstrumentId }) => ({
        label: description,
        value: transferInstrumentId,
        description: eligible || !reason ? undefined : i18n.get(INELIGIBILITY_REASON_MESSAGES[reason]),
        data: { disabled: !eligible },
    }))
);

const isOptionDisabled = (option: { data?: unknown }) =>
    !!option.data && typeof option.data === 'object' && 'disabled' in option.data && option.data.disabled === true;

const onChange = (value: string | number | { value?: string | number } | Array<unknown> | undefined) => {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    // `!= null` also skips a `null` from Bento, which `String()` would otherwise turn into a "null" transfer instrument id.
    if (nextValue != null) selectedTransferInstrumentId.value = String(nextValue);
};
</script>

<template>
    <BentoDropdown
        :disabled="props.disabled"
        :is-option-disabled="isOptionDisabled"
        :items="options"
        :label="i18n.get('cashOut.request.fields.transferInstrument.label')"
        :model-value="selectedTransferInstrumentId ?? ''"
        :placeholder="i18n.get('cashOut.request.fields.transferInstrument.placeholder')"
        @update:model-value="onChange"
    />
</template>
