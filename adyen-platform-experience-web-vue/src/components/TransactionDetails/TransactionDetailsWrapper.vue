<script setup lang="ts">
import type { TransactionDetailsExternalProps } from './types';
import { CoreProvider } from '../../core/Context';
import { ConfigProvider } from '../../core/ConfigContext';
import { ModalProvider } from '../../core/ModalContext';
import TransactionData from './TransactionData.vue';

const props = defineProps<TransactionDetailsExternalProps>();
</script>

<template>
    <CoreProvider :i18n="props.core.i18n">
        <ConfigProvider :session="props.core.session" :loading-context="props.core.loadingContext">
            <ModalProvider>
                <TransactionData
                    :id="props.id"
                    :hide-title="props.hideTitle"
                    :on-contact-support="props.onContactSupport"
                    :data-customization="props.dataCustomization"
                />
            </ModalProvider>
        </ConfigProvider>
    </CoreProvider>
</template>
