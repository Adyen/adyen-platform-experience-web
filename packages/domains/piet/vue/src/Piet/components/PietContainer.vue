<script setup lang="ts">
import { ref } from 'vue';
import Piet from './Piet.vue';
import PietActionModal from './PietActionModal.vue';
import { useChat } from '../composables/useChat';
import type { PietActionRequest } from '../../../../domain/src';
import type { PietComponentProps } from '../types';

const props = defineProps<PietComponentProps>();
const activeAction = ref<PietActionRequest>();
const { error, isStreaming, messages, retry, runningTools, send, starters, stop } = useChat(() => props.chat);
</script>

<template>
    <Piet
        :has-error="!!error"
        :is-chat-enabled="!!props.chat"
        :is-streaming="isStreaming"
        :messages="messages"
        :on-action="props.renderAction ? (request: PietActionRequest) => (activeAction = request) : undefined"
        :on-contact-support="props.onContactSupport"
        :on-retry="retry"
        :on-send="send"
        :on-stop="stop"
        :running-tools="runningTools"
        :starters="starters"
    />

    <PietActionModal
        v-if="props.renderAction"
        :request="activeAction"
        :render-action="props.renderAction"
        :on-close="() => (activeAction = undefined)"
    />
</template>
