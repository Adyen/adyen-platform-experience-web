<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { SHARED_CONTRACT_KEYS } from '@integration-components/capital/domain';
import type { IContractType } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';

const props = defineProps<{
    contractType: IContractType;
    region?: string;
}>();

const { getContractCopy } = useContractCopy(() => props.contractType);
const regulatoryNotice = computed(() => (props.region === 'GB' ? getContractCopy(SHARED_CONTRACT_KEYS.regulatoryNotice) : undefined));
</script>

<template>
    <BentoAlert v-if="regulatoryNotice" variant="tip">
        <template #description>
            {{ regulatoryNotice }}
        </template>
    </BentoAlert>
</template>
