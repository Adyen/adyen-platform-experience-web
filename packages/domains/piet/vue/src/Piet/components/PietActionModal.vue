<script setup lang="ts">
import { computed } from 'vue';
import { BentoModal } from '@adyen/bento-vue3';
import { ModalContextProvider, useCoreContext } from '@integration-components/core/vue';
import { PIET_ACTION_TITLE_KEYS } from '../../../../domain/src';
import type { PietActionRequest } from '../../../../domain/src';
import type { PietComponentProps } from '../types';
import PietActionHost from './PietActionHost.vue';

const props = defineProps<{
    onClose: () => void;
    renderAction: NonNullable<PietComponentProps['renderAction']>;
    request?: PietActionRequest;
}>();

const { i18n } = useCoreContext();
const title = computed(() => (props.request ? i18n.get(PIET_ACTION_TITLE_KEYS[props.request.type]) : ''));
</script>

<template>
    <BentoModal :is-open="!!props.request" size="large" @close-modal="props.onClose">
        {{ title }}
        <template #content>
            <ModalContextProvider>
                <!-- Keyed so that opening another action mounts a fresh flow -->
                <PietActionHost
                    v-if="props.request"
                    :key="JSON.stringify(props.request)"
                    :request="props.request"
                    :render-action="props.renderAction"
                />
            </ModalContextProvider>
        </template>
    </BentoModal>
</template>
