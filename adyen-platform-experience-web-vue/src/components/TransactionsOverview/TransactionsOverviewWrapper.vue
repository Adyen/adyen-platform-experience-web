<script setup lang="ts">
import type { TransactionsOverviewExternalProps } from './types';
import { CoreProvider } from '../../core/Context';
import { ConfigProvider } from '../../core/ConfigContext';
import { ModalProvider } from '../../core/ModalContext';
import TransactionsOverviewContainer from './components/TransactionsOverviewContainer.vue';

const props = defineProps<TransactionsOverviewExternalProps>();
</script>

<template>
    <CoreProvider :i18n="props.core.i18n">
        <ConfigProvider :session="props.core.session" :loading-context="props.core.loadingContext">
            <ModalProvider>
                <TransactionsOverviewContainer
                    :balance-account-id="props.balanceAccountId"
                    :allow-limit-selection="props.allowLimitSelection"
                    :preferred-limit="props.preferredLimit"
                    :on-record-selection="props.onRecordSelection"
                    :show-details="props.showDetails"
                    :hide-title="props.hideTitle"
                    :on-contact-support="props.onContactSupport"
                    :on-filters-changed="props.onFiltersChanged"
                    :data-customization="props.dataCustomization"
                />
            </ModalProvider>
        </ConfigProvider>
    </CoreProvider>
</template>
