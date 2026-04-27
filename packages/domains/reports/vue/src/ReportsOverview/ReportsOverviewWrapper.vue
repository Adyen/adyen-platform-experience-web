<script setup lang="ts">
import type { ReportsOverviewExternalProps } from './types';
import { CoreProvider, ConfigProvider } from '@integration-components/core/vue';
import ReportsOverviewContainer from './components/ReportsOverviewContainer.vue';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<ReportsOverviewExternalProps>();
</script>

<template>
    <CoreProvider :i18n="props.core.i18n">
        <ConfigProvider :session="props.core.session">
            <ReportsOverviewContainer
                :balance-account-id="props.balanceAccountId"
                :allow-limit-selection="props.allowLimitSelection"
                :preferred-limit="props.preferredLimit"
                :hide-title="props.hideTitle"
                :on-contact-support="props.onContactSupport"
                :on-filters-changed="props.onFiltersChanged"
                :data-customization="props.dataCustomization"
            />
        </ConfigProvider>
    </CoreProvider>
</template>
