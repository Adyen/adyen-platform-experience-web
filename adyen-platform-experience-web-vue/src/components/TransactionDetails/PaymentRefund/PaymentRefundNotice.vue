<script setup lang="ts">
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { useModalContext } from '../../../core/ModalContext';
import { TX_DATA_CONTAINER, TX_DATA_HEAD_CONTAINER } from '../constants';

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
</script>

<template>
    <div :class="[TX_DATA_CONTAINER, TX_DATA_HEAD_CONTAINER]">
        <component :is="withinModal ? 'h2' : 'div'">
            <bento-typography variant="subtitle" weight="stronger">
                {{ i18n.get('transactions.details.refund.title') }}
            </bento-typography>
        </component>
        <bento-typography variant="body">
            {{ i18n.get('transactions.details.refund.processingInfo') }}
        </bento-typography>
    </div>
</template>
