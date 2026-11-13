<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { ComponentShell, type ComponentShellState } from '@integration-components/composables-vue';
import type { CashOutRequestComponentProps, CashOutResult } from '../../types';
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
const { balanceAccountOptions, eligibility, selectedBalanceAccountId } = cashOutState;

const feesError = ref<AdyenPlatformExperienceError>();

const errorInfo = computed(() => (feesError.value ? getCashOutErrorInfo(feesError.value) : cashOutState.errorInfo.value));
const shellState = computed<ComponentShellState>(() => (feesError.value ? 'error' : cashOutState.shellState.value));

const handleFeesError = (error: AdyenPlatformExperienceError) => {
    feesError.value = error;
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
    <CashOutRequestResult v-if="result" :status="result.status" />
    <div v-else :class="styles.root">
        <CashOutHeader
            v-model:selected-balance-account-id="selectedBalanceAccountId"
            :balance-account-options="balanceAccountOptions"
            :hide-title="props.hideTitle"
            title-key="cashOut.request.title"
        />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutRequestSkeleton />
            </template>
            <!-- Keyed by balance account, so switching accounts starts a new request from that account's eligibility. -->
            <CashOutRequestForm
                v-if="eligibility && selectedBalanceAccountId"
                :key="selectedBalanceAccountId"
                :balance-account-id="selectedBalanceAccountId"
                :eligibility="eligibility"
                :on-result="handleResult"
                :on-contact-support="props.onContactSupport"
                :on-fees-error="handleFeesError"
                :reference-for-beneficiary="props.referenceForBeneficiary"
                :transfer-description="props.transferDescription"
            />
        </ComponentShell>
    </div>
</template>
