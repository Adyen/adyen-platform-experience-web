<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AdyenPlatformExperienceVue } from './index';
import type { CoreInstance } from './core/types';
import { CoreProvider } from './core/Context';
import { ConfigProvider } from './core/ConfigContext';
import { PayoutDetailsInternal } from './components/PayoutDetails';
import sessionRequest from './utils/sessionRequest';
import { TransactionDetailsInternal } from './components/TransactionDetails';
import { TransactionsOverviewInternal } from './components/TransactionsOverview';
import '@adyen/bento-vue3/styles/bento-light';

const core = ref<CoreInstance | null>(null);
const isReady = ref(false);
const error = ref<string | null>(null);

// Payout query parameters from stories/api/payoutDetails.stories.tsx
const balanceAccountId = ref('BA32CKZ223227T5L6834T3LBX');
const balanceAccountDescription = ref('Main Balance Account');
const payoutCreatedAt = ref('2025-06-13T00:00:00.000+00:00');
const transactionId = ref('EVJN4294L223223W5NT6LD32776C5DEUR');

onMounted(async () => {
    try {
        core.value = await AdyenPlatformExperienceVue({
            environment: 'test',
            locale: 'en-US',
            onSessionCreate: async () => {
                return await sessionRequest();
            },
            onError: err => {
                error.value = err.message;
                console.error('Core error:', err);
            },
        });
        isReady.value = true;
    } catch (err) {
        error.value = (err as Error).message;
        console.error('Failed to initialize:', err);
    }
});
</script>

<template>
    <!-- <div v-if="error" class="error-container">
        <p>Error: {{ error }}</p>
    </div>
    <div v-else-if="!isReady" class="loading-container">
        <p>Initializing...</p>
    </div> -->
    <CoreProvider :i18n="core?.i18n">
        <ConfigProvider
            :session="core?.session ?? null"
            :loading-context="core?.loadingContext ?? ''"
            :on-error="
                (err: Error) => {
                    error = err.message;
                }
            "
        >
            <div class="app-container">
                <PayoutDetailsInternal
                    :balance-account-id="balanceAccountId"
                    :balance-account-description="balanceAccountDescription"
                    :created-at="payoutCreatedAt"
                />
                <hr style="margin: 32px 0" />
                <TransactionDetailsInternal :id="transactionId" />
                <hr style="margin: 32px 0" />
                <TransactionsOverviewInternal :balance-account-id="balanceAccountId" />
            </div>
        </ConfigProvider>
    </CoreProvider>
</template>

<style scoped>
.app-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
    color: #1a1a1a;
    margin-bottom: 24px;
}

.adyen-pe-payout-details-wrapper {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
}

.adyen-pe-overview-details {
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 24px;

    &--error-container {
        padding: 16px;
    }
}

.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-container {
    color: #d32f2f;
}
</style>
