<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getUnavailableReasonMessage } from '@integration-components/cashOut/domain';
import type { ICashOutEligibility } from '@integration-components/types';
import styles from './UnavailableReasonAlert.module.scss';

const props = defineProps<{
    eligibility: ICashOutEligibility;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();

const message = computed(() => getUnavailableReasonMessage(props.eligibility));
const showContactSupport = computed(() => Boolean(message.value?.offersContactSupport && props.onContactSupport));
// The reach out button already offers to contact support, so the message doesn't ask it again
const messageKey = computed(() => (showContactSupport.value && message.value?.keyWithContactSupport) || message.value?.key);
</script>

<template>
    <BentoAlert v-if="message" :type="message.type" variant="tip" role="status">
        <template #description>
            <span>{{ i18n.get(messageKey!) }}</span>
            <!-- Not in the actions slot, which a tip alert puts beside the message -->
            <div v-if="showContactSupport" :class="styles.actions">
                <BentoButton variant="tertiary" @click="props.onContactSupport">
                    {{ i18n.get('cashOut.common.contactSupport.label') }}
                </BentoButton>
            </div>
        </template>
    </BentoAlert>
</template>
