<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { ComponentShell, type ComponentShellState } from '@integration-components/composables-vue';
import type { CashOutRequestComponentProps, CashOutResult } from '../../types';
import {
    CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY,
    CASH_OUT_REQUEST_ANALYTICS_CATEGORY,
    provideCashOutAnalytics,
} from '../../../shared/composables/useCashOutAnalytics';
import { useCashOutLoadAnalytics } from '../../../shared/composables/useCashOutLoadAnalytics';
import { getCashOutErrorInfo, useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import CashOutRequestForm from '../CashOutRequestForm/CashOutRequestForm.vue';
import CashOutRequestResult from '../CashOutRequestResult/CashOutRequestResult.vue';
import CashOutRequestSkeleton from '../CashOutRequestSkeleton/CashOutRequestSkeleton.vue';
import styles from './CashOutRequest.module.scss';

const props = defineProps<CashOutRequestComponentProps>();

const cashOutState = useCashOutState({
    initialBalanceAccountId: () => props.initialBalanceAccountId,
    eligibility: () => props.eligibility,
});
const {
    balanceAccountOptions,
    eligibility,
    isFetchingEligibility,
    lastUpdated,
    loadingError,
    refresh,
    refreshAvailableAmounts,
    selectedAccountKey,
    selectedBalanceAccountId,
} = cashOutState;

// In the modal of the overview, the request is part of the overview, which tells its own landing and what kept it from loading.
const analytics = provideCashOutAnalytics({
    category: props.inModal ? CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY : CASH_OUT_REQUEST_ANALYTICS_CATEGORY,
    subCategory: 'Request',
});

useCashOutLoadAnalytics(analytics, {
    eligibility,
    balanceAccountCount: () => balanceAccountOptions.value.length,
    loadingError,
    enabled: () => !props.inModal,
});

// The request starts once its form is first shown, so a completed cashOut tells how long it took from there.
watch(
    () => !!eligibility.value,
    isShown => {
        if (isShown) analytics.markStarted();
    },
    { immediate: true }
);

const feesError = ref<AdyenPlatformExperienceError>();

// While the cashOut is sent, nothing may replace the form: unmounting it cancels the cashOut in the browser while the server may
// still make it, and then no result would be shown. So the refresh does nothing, the balance account can't be switched, and the
// component showing this one is told, so a modal can't be closed meanwhile.
const isInstructing = ref(false);
const handleInstructingChange = (value: boolean) => {
    isInstructing.value = value;
    props.onInstructingChange?.(value);
};

const refreshUnlessInstructing = () => {
    if (!isInstructing.value) refresh();
};

const refreshAvailableAmountsUnlessInstructing = () => {
    if (!isInstructing.value) refreshAvailableAmounts();
};

const errorInfo = computed(() => (feesError.value ? getCashOutErrorInfo(feesError.value) : cashOutState.errorInfo.value));
const shellState = computed<ComponentShellState>(() => (feesError.value ? 'error' : cashOutState.shellState.value));

const handleFeesError = (error: AdyenPlatformExperienceError) => {
    feesError.value = error;
    analytics.trackBackendError('fees', error);
};

// The fees error belongs to the balance account it happened on, so selecting another one shows that account's form again.
watch(selectedBalanceAccountId, () => {
    feesError.value = undefined;
});

const result = ref<CashOutResult>();

const handleResult = (cashOutResult: CashOutResult) => {
    result.value = cashOutResult;
    props.onResultShown?.();
    if (cashOutResult.status === 'success') props.onSubmit?.(cashOutResult.cashOut);
};
</script>

<template>
    <CashOutRequestResult
        v-if="result"
        :status="result.status"
        :currency="result.status === 'success' ? result.cashOut.amount.currency : undefined"
        :in-modal="props.inModal"
    />
    <div v-else :class="styles.root">
        <CashOutHeader
            v-model:selected-balance-account-id="selectedBalanceAccountId"
            :balance-account-options="balanceAccountOptions"
            :hide-title="props.hideTitle"
            :disable-balance-account-selector="isInstructing"
            title-key="cashOut.request.title"
            :last-updated="lastUpdated"
            :is-refreshing="isFetchingEligibility"
            :on-refresh="shellState === 'error' ? undefined : refreshUnlessInstructing"
            :on-balance-account-selector-close="refreshAvailableAmountsUnlessInstructing"
        />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutRequestSkeleton />
            </template>
            <!-- Keyed by balance account, so switching accounts starts a new request from that account's eligibility. -->
            <CashOutRequestForm
                v-if="eligibility && selectedAccountKey"
                :key="selectedBalanceAccountId"
                :account-key="selectedAccountKey"
                :eligibility="eligibility"
                :on-result="handleResult"
                :on-contact-support="props.onContactSupport"
                :on-fees-error="handleFeesError"
                :on-instructing-change="handleInstructingChange"
                :reference-for-beneficiary="props.referenceForBeneficiary"
                :transfer-description="props.transferDescription"
            />
        </ComponentShell>
    </div>
</template>
