<script setup lang="ts">
// Uses plain elements + token SCSS instead of BentoTypography because shared/core
// must not depend on @adyen/bento-vue3.
import { computed } from 'vue';
import { useCoreContext } from '../../Context/useCoreContext';
import type { TranslationKey } from '../../../translations';
import './ErrorMessageDisplay.scss';

const props = withDefaults(
    defineProps<{
        title: TranslationKey;
        message?: TranslationKey | TranslationKey[];
        centered?: boolean;
        testId?: string;
    }>(),
    { centered: false, testId: 'error-message-display' }
);

const { i18n } = useCoreContext();

const messages = computed<TranslationKey[]>(() => {
    if (!props.message) return [];
    return Array.isArray(props.message) ? props.message : [props.message];
});
</script>

<template>
    <div
        :data-testid="props.testId"
        :class="[
            'adyen-pe-core-error-message-display',
            'adyen-pe-core-error-message-display--outlined',
            { 'adyen-pe-core-error-message-display--centered': props.centered },
        ]"
    >
        <div class="adyen-pe-core-error-message-display__title">
            {{ i18n.get(props.title) }}
        </div>
        <p v-if="messages.length" class="adyen-pe-core-error-message-display__message">
            <template v-for="(msg, index) in messages" :key="msg">
                <br v-if="index > 0" />
                {{ i18n.get(msg) }}
            </template>
        </p>
    </div>
</template>
