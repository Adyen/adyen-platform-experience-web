<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { getUnavailableReasonMessage } from '@integration-components/cashOut/domain';
import type { ICashOutEligibility } from '@integration-components/types';

const props = defineProps<{
    eligibility: ICashOutEligibility;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();

const message = computed(() => getUnavailableReasonMessage(props.eligibility));
const showContactSupport = computed(() => Boolean(message.value?.offersContactSupport && props.onContactSupport));
</script>

<template>
    <BentoAlert v-if="message" type="warning" role="status">
        <template #description>{{ i18n.get(message.key) }}</template>
        <template v-if="showContactSupport" #actions>
            <BentoButton variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('cashOut.common.contactSupport.label') }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
