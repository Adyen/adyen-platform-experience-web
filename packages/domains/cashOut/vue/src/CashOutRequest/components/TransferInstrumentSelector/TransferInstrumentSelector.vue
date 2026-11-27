<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoDropdown } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getTransferInstrumentOptions } from '@integration-components/cashOut/domain';
import type { ICashOutTransferInstrument } from '@integration-components/types';
import { getDropdownValue } from '../../../shared/utils/getDropdownValue';
import { isSearchable } from '../../../shared/utils/isSearchable';
import { useCashOutAnalytics } from '../../../shared/composables/useCashOutAnalytics';

const props = defineProps<{
    /** The currency of the cashOut, named in the reason of accounts that can't receive it. */
    currency: string;
    disabled?: boolean;
    transferInstruments: ICashOutTransferInstrument[];
}>();

const selectedTransferInstrumentId = defineModel<string | undefined>({ required: true });

const { i18n } = useCoreContext();
const { trackSelection } = useCashOutAnalytics();
const dropdown = ref<{ $el?: Element }>();

// Ineligible accounts are disabled.
const options = computed(() =>
    getTransferInstrumentOptions(props.transferInstruments, props.currency).map(
        ({ transferInstrumentId, description, eligible, ineligibilityReason }) => ({
            label: description,
            value: transferInstrumentId,
            description: ineligibilityReason ? i18n.get(ineligibilityReason.key, { values: ineligibilityReason.values }) : undefined,
            data: { disabled: !eligible },
        })
    )
);

const isOptionDisabled = (option: { data?: unknown }) =>
    !!option.data && typeof option.data === 'object' && 'disabled' in option.data && option.data.disabled === true;

const onChange = (value: Parameters<typeof getDropdownValue>[0]) => {
    const nextValue = getDropdownValue(value);
    if (nextValue === undefined) return;
    trackSelection('Changed bank account', {
        countProperty: 'bankAccountCount',
        nextValue,
        options: options.value,
        previousValue: selectedTransferInstrumentId.value,
        root: dropdown.value?.$el,
    });
    selectedTransferInstrumentId.value = nextValue;
};
</script>

<template>
    <BentoDropdown
        ref="dropdown"
        :disabled="props.disabled"
        :dynamic-filtering="isSearchable(options)"
        :is-option-disabled="isOptionDisabled"
        :items="options"
        :label="i18n.get('cashOut.request.fields.transferInstrument.label')"
        :model-value="selectedTransferInstrumentId ?? ''"
        :placeholder="i18n.get('cashOut.request.fields.transferInstrument.placeholder')"
        @update:model-value="onChange"
    />
</template>
