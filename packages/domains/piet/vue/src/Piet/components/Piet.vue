<script setup lang="ts">
import { BentoHeader } from '@adyen/bento-vue3';
import { useCoreContext, useShouldHideTitles } from '@integration-components/core/vue';
import PietBackground from './PietBackground.vue';
import PietChat from './PietChat.vue';
import type { PietActionRequest, PietStarter, PietTool } from '../../../../domain/src';
import type { PietChatMessage, PietComponentProps } from '../types';
import styles from './Piet.module.scss';

const props = defineProps<
    Pick<PietComponentProps, 'onContactSupport'> & {
        /** Opens a flow suggested by the assistant. Without it, those suggestions are not shown. */
        onAction?: (request: PietActionRequest) => void;
        hasError: boolean;
        isChatEnabled: boolean;
        isStreaming: boolean;
        messages: PietChatMessage[];
        onRetry: () => void;
        onSend: (content: string) => void;
        onStop: () => void;
        runningTools: PietTool[];
        starters: readonly PietStarter[];
    }
>();

const { i18n, getImageAsset } = useCoreContext();
const hideTitles = useShouldHideTitles();

// Placeholder illustration (shared asset) until the final Piet visual exists.
const placeholderImage = getImageAsset?.({ name: 'generic-use-first-touch' });
</script>

<template>
    <div :class="styles.root" data-testid="piet">
        <PietBackground />

        <BentoHeader v-if="!hideTitles" variant="component" :title="i18n.get('piet.common.title')" />

        <PietChat
            v-if="props.isChatEnabled"
            :has-error="props.hasError"
            :image="placeholderImage"
            :is-streaming="props.isStreaming"
            :on-action="props.onAction"
            :messages="props.messages"
            :on-contact-support="props.onContactSupport"
            :on-retry="props.onRetry"
            :on-send="props.onSend"
            :on-stop="props.onStop"
            :running-tools="props.runningTools"
            :starters="props.starters"
        />

        <img v-else-if="placeholderImage" :class="styles.image" :src="placeholderImage" alt="" data-testid="piet-image" />
    </div>
</template>
