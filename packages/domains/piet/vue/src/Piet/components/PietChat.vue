<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { BentoAlert, BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import PietChatInput from './PietChatInput.vue';
import PietChatMessage from './PietChatMessage.vue';
import type { PietActionRequest, PietStarter, PietTool } from '../../../../domain/src';
import type { PietChatMessage as PietChatMessageType, PietComponentProps } from '../types';
import styles from './PietChat.module.scss';

const props = defineProps<
    Pick<PietComponentProps, 'onContactSupport'> & {
        onAction?: (request: PietActionRequest) => void;
        hasError: boolean;
        image?: string;
        isStreaming: boolean;
        messages: PietChatMessageType[];
        onRetry: () => void;
        onSend: (content: string) => void;
        onStop: () => void;
        runningTools: PietTool[];
        starters: readonly PietStarter[];
    }
>();

const { i18n } = useCoreContext();
const messageList = ref<HTMLElement | null>(null);

// Keeps the latest text in view while the reply streams in.
watch(
    () => [props.messages.length, props.messages[props.messages.length - 1]?.content, props.runningTools.length],
    async () => {
        await nextTick();
        messageList.value?.scrollTo({ top: messageList.value.scrollHeight });
    }
);
</script>

<template>
    <div :class="styles.root" data-testid="piet-chat">
        <div
            ref="messageList"
            role="log"
            aria-live="polite"
            :aria-label="i18n.get('piet.chat.messages.label')"
            :class="styles.messages"
            data-testid="piet-chat-messages"
        >
            <div v-if="!props.messages.length" :class="styles.empty">
                <img v-if="props.image" :class="styles.image" :src="props.image" alt="" />
                <BentoTypography variant="body" :class="styles.emptyText">
                    {{ i18n.get('piet.chat.empty.title') }}
                </BentoTypography>
                <div
                    v-if="props.starters.length"
                    :class="styles.starters"
                    role="group"
                    :aria-label="i18n.get('piet.chat.starters.label')"
                    data-testid="piet-chat-starters"
                >
                    <BentoButton
                        v-for="starter in props.starters"
                        :key="starter.id"
                        size="small"
                        variant="secondary"
                        @click="props.onSend(i18n.get(starter.messageKey))"
                    >
                        {{ i18n.get(starter.labelKey) }}
                    </BentoButton>
                </div>
            </div>

            <PietChatMessage
                v-for="(message, index) in props.messages"
                :key="message.id"
                :message="message"
                :is-streaming="props.isStreaming && index === props.messages.length - 1"
                :options-enabled="index === props.messages.length - 1 && !props.isStreaming && !props.hasError"
                :on-select-action="props.onAction"
                :on-select-option="props.onSend"
            />

            <BentoTypography
                v-for="tool in props.runningTools"
                :key="tool.name"
                variant="body"
                :class="styles.activity"
                data-testid="piet-chat-activity"
            >
                {{ i18n.get(tool.statusKey) }}
            </BentoTypography>
        </div>

        <BentoAlert v-if="props.hasError" type="critical" data-testid="piet-chat-error">
            {{ i18n.get('piet.chat.errors.sendFailed') }}
            <template #actions>
                <BentoButton variant="tertiary" @click="props.onRetry">
                    {{ i18n.get('piet.chat.actions.retry') }}
                </BentoButton>
                <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                    {{ i18n.get('piet.common.errors.contactSupport') }}
                </BentoButton>
            </template>
        </BentoAlert>

        <PietChatInput :is-streaming="props.isStreaming" :on-send="props.onSend" :on-stop="props.onStop" />
    </div>
</template>
