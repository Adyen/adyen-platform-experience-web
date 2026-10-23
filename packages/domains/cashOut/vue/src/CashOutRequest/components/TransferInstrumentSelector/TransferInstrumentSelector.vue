<script setup lang="ts">
import { computed } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutTransferInstrument, ICashOutTransferInstrumentIneligibilityReason } from '@integration-components/types';

const INELIGIBILITY_REASON_MESSAGES = {
    noInstantTransferRoute: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute',
    // Without the capability the account holder can't cash out at all, so the component never lists accounts for this reason.
    sendToTransferInstrumentNotAllowed: undefined,
    transferInstrumentCurrencyMismatch: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch',
} as const satisfies Record<ICashOutTransferInstrumentIneligibilityReason, TranslationKey | undefined>;

const props = defineProps<{
    /** The currency of the cashOut, named in the reason of accounts that can't receive it. */
    currency: string;
    disabled?: boolean;
    transferInstruments: ICashOutTransferInstrument[];
}>();

const selectedTransferInstrumentId = defineModel<string | undefined>({ required: true });

const { i18n } = useCoreContext();

// Ineligible accounts stay listed, disabled, with the reason they can't receive the cashOut.
// Eligible accounts come first; the sort is stable, so each group keeps the order of the API.
const options = computed(() =>
    [...props.transferInstruments]
        .sort((a, b) => Number(b.eligible) - Number(a.eligible))
        .map(({ description, eligible, ineligibilityReasons: [reason], transferInstrumentId }) => {
            const reasonMessage = eligible || !reason ? undefined : INELIGIBILITY_REASON_MESSAGES[reason];
            const values = reason === 'transferInstrumentCurrencyMismatch' ? { currency: props.currency } : undefined;
            return {
                label: description,
                value: transferInstrumentId,
                description: reasonMessage ? i18n.get(reasonMessage, { values }) : undefined,
                data: { disabled: !eligible },
            };
        })
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
