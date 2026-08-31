<script setup lang="ts">
import { BentoTypography } from '@adyen/bento-vue3';
import layoutStyles from '../TransactionDataLayout.module.scss';
import { useTransactionsContext } from '../../../integration/context';

const { i18n } = useTransactionsContext();
</script>

<template>
    <div :class="layoutStyles.container">
        <BentoTypography variant="title" stronger>{{ i18n.get('transactions.details.refund.title') }}</BentoTypography>
        <BentoTypography variant="body">{{ i18n.get('transactions.details.refund.processingInfo') }}</BentoTypography>
    </div>
</template>
