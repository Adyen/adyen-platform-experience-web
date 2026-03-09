<script setup lang="ts">
import type { PayoutDetailsExternalProps } from './types';
import { CoreProvider } from '../../core/Context';
import { ConfigProvider } from '../../core/ConfigContext';
import PayoutDetails from './PayoutDetails.vue';

const props = defineProps<PayoutDetailsExternalProps>();
</script>

<template>
    <CoreProvider :i18n="props.core.i18n">
        <ConfigProvider :session="props.core.session" :loading-context="props.core.loadingContext">
            <PayoutDetails :balance-account-id="props.id" :created-at="props.date" :data-customization="props.dataCustomization" />
        </ConfigProvider>
    </CoreProvider>
</template>
