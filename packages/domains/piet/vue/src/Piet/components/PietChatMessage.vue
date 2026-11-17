<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoLoadingIndicator, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import { hideUnfinishedTextToolCall, markdownToHtml, parseReplyOptions, type PietActionRequest, type ReplyOption } from '../../../../domain/src';
import type { PietChatMessage } from '../types';
import styles from './PietChatMessage.module.scss';

const props = defineProps<{
    isStreaming: boolean;
    message: PietChatMessage;
    /** Whether the options the assistant offers can be chosen. Only the latest reply's options are still relevant. */
    optionsEnabled?: boolean;
    /** Opens a flow. Options that suggest one are hidden without it, since the button would do nothing. */
    onSelectAction?: (request: PietActionRequest) => void;
    onSelectOption?: (message: string) => void;
}>();

const { i18n } = useCoreContext();
const isUser = computed(() => props.message.role === 'user');
// Only the assistant's replies are markdown. What the user typed is shown as plain text.
const reply = computed(() =>
    isUser.value
        ? { text: '', options: [] }
        : parseReplyOptions(props.isStreaming ? hideUnfinishedTextToolCall(props.message.content) : props.message.content, props.isStreaming)
);
const html = computed(() => markdownToHtml(reply.value.text));
const isWaitingForReply = computed(() => props.isStreaming && !isUser.value && !reply.value.text && !reply.value.options.length);
const options = computed(() =>
    props.optionsEnabled && !props.isStreaming ? reply.value.options.filter(({ action }) => !action || !!props.onSelectAction) : []
);

const select = ({ action, message }: ReplyOption) => (action ? props.onSelectAction?.(action) : props.onSelectOption?.(message));
</script>

<template>
    <div :class="[styles.root, isUser ? styles.user : styles.assistant]" :data-role="props.message.role" data-testid="piet-chat-message">
        <span :class="accessibilityStyles.visuallyHidden">
            {{ i18n.get(isUser ? 'piet.chat.roles.user' : 'piet.chat.roles.assistant') }}
        </span>

        <BentoLoadingIndicator v-if="isWaitingForReply" :aria-label="i18n.get('piet.chat.statuses.typing')" />
        <BentoTypography v-else-if="isUser" el="p" variant="body" :class="styles.content">
            {{ props.message.content }}
        </BentoTypography>
        <BentoTypography v-else el="div" variant="body">
            <!-- eslint-disable-next-line vue/no-v-html -- sanitized by markdownToHtml: raw HTML escaped, no images, http(s)/mailto links only -->
            <div :class="styles.markdown" data-testid="piet-chat-markdown" v-html="html" />
        </BentoTypography>

        <div
            v-if="options.length"
            :class="styles.options"
            role="group"
            :aria-label="i18n.get('piet.chat.options.label')"
            data-testid="piet-chat-options"
        >
            <BentoButton v-for="option in options" :key="option.label" size="small" variant="secondary" @click="select(option)">
                {{ option.label }}
            </BentoButton>
        </div>
    </div>
</template>
