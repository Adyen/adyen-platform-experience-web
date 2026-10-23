<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { ComponentShell, type ComponentShellState } from '@integration-components/composables-vue';
import type { CashOutRequestProps, CashOutResult } from '../../types';
import { getCashOutErrorInfo, useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import CashOutRequestForm from '../CashOutRequestForm/CashOutRequestForm.vue';
import CashOutRequestResult from '../CashOutRequestResult/CashOutRequestResult.vue';
import CashOutRequestSkeleton from '../CashOutRequestSkeleton/CashOutRequestSkeleton.vue';
import styles from './CashOutRequest.module.scss';

const props = defineProps<CashOutRequestProps>();

const cashOutState = useCashOutState({
    balanceAccountId: () => props.balanceAccountId,
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

const handleCashOutResult = (cashOutResult: CashOutResult) => {
    result.value = cashOutResult;
    props.onCashOutResult?.(cashOutResult);
    if (cashOutResult.status === 'success') props.onCashOutInstructed?.(cashOutResult.cashOut);
};
</script>

<template>
    <CashOutRequestResult v-if="result" :status="result.status" :on-dismiss="props.onDismiss" />
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
                :on-cash-out-result="handleCashOutResult"
                :on-dismiss="props.onDismiss"
                :on-contact-support="props.onContactSupport"
                :on-fees-error="handleFeesError"
            />
        </ComponentShell>
    </div>
</template>
