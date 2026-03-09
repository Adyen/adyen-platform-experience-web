<script setup lang="ts">
import { ref } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import {
    REFUND_REFERENCE_CHAR_LIMIT,
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CHARS,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_HEAD,
    TX_DATA_INPUT_TEXTAREA,
} from '../constants';

const { i18n } = useCoreContext();

const reference = ref('');
const characters = ref(0);

function onInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const selectionEnd = textarea.selectionEnd;
    let value = textarea.value;

    // Normalize: trim to char limit
    if (value.length > REFUND_REFERENCE_CHAR_LIMIT) {
        value = value.substring(0, REFUND_REFERENCE_CHAR_LIMIT);
    }

    textarea.value = value;
    textarea.setSelectionRange(selectionEnd, selectionEnd);

    if (value !== reference.value) {
        reference.value = value;
        characters.value = value.length;
    }
}
</script>

<template>
    <div :class="TX_DATA_CONTAINER">
        <div :class="TX_DATA_INPUT_HEAD">
            <bento-typography variant="body" weight="stronger">
                {{ i18n.get('transactions.details.refund.inputs.reference.label') }}
            </bento-typography>
            <bento-typography :class="TX_DATA_INPUT_CHARS" variant="body">
                {{ characters }} / {{ REFUND_REFERENCE_CHAR_LIMIT }}
            </bento-typography>
        </div>

        <div :class="[TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_TEXT]">
            <label>
                <textarea
                    :class="[TX_DATA_INPUT, TX_DATA_INPUT_TEXTAREA]"
                    :placeholder="i18n.get('transactions.details.refund.inputs.reference.placeholder')"
                    :value="reference"
                    rows="2"
                    @input="onInput"
                />
            </label>
        </div>
    </div>
</template>
