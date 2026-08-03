<script setup lang="ts">
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { TX_DATA_HEAD_CONTAINER } from '../../../../../domain/src';
import styles from './PaymentRefund.module.scss';

const { i18n } = useCoreContext();
</script>

<template>
    <div :class="[styles.container, TX_DATA_HEAD_CONTAINER]">
        <BentoTypography variant="title" stronger>{{ i18n.get('transactions.details.refund.title') }}</BentoTypography>
        <BentoTypography variant="body">{{ i18n.get('transactions.details.refund.processingInfo') }}</BentoTypography>
    </div>
</template>
