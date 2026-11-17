<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoButton, BentoTextarea } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './PietChatInput.module.scss';

const props = defineProps<{
    isStreaming: boolean;
    onSend: (content: string) => void;
    onStop: () => void;
}>();

const { i18n } = useCoreContext();
const draft = ref('');
const canSend = computed(() => !props.isStreaming && draft.value.trim().length > 0);

const submit = () => {
    if (!canSend.value) return;

    props.onSend(draft.value);
    draft.value = '';
};

// Enter sends, Shift+Enter inserts a line break. Ignored while an IME composition is in progress.
// Registered in the capture phase so it runs before the textarea (or Bento) can handle or stop the event, and it reads
// the typed text from the textarea itself in case the model has not been synced yet.
const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

    event.preventDefault();
    if (event.target instanceof HTMLTextAreaElement) draft.value = event.target.value;
    submit();
};
</script>

<template>
    <form :class="styles.root" data-testid="piet-chat-input" @submit.prevent="submit">
        <div :class="styles.field" @keydown.capture="onKeydown">
            <BentoTextarea
                v-model="draft"
                resizable="none"
                :aria-label="i18n.get('piet.chat.input.label')"
                :placeholder="i18n.get('piet.chat.input.placeholder')"
            />
        </div>

        <div :class="styles.actions">
            <BentoButton v-if="props.isStreaming" :class="styles.button" type="button" variant="secondary" @click="props.onStop">
                {{ i18n.get('piet.chat.actions.stop') }}
            </BentoButton>
            <BentoButton v-else :class="styles.button" type="submit" variant="primary" :disabled="!canSend">
                {{ i18n.get('piet.chat.actions.send') }}
            </BentoButton>
        </div>
    </form>
</template>
