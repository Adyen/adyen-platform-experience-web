<script setup lang="ts">
import { ComponentShell } from '@integration-components/composables-vue';
import type { CashOutRequestProps } from '../../types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import CashOutRequestSkeleton from '../CashOutRequestSkeleton/CashOutRequestSkeleton.vue';
import styles from './CashOutRequest.module.scss';

const props = defineProps<CashOutRequestProps>();

const { balanceAccountOptions, errorInfo, selectedBalanceAccountId, shellState } = useCashOutState({
    balanceAccountId: () => props.balanceAccountId,
    eligibility: () => props.eligibility,
});
</script>

<template>
    <div :class="styles.root">
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
            <!-- Holds the height of the designed form until its fields are built, so loading doesn't resize the component. -->
            <CashOutRequestSkeleton :class="styles.placeholder" />
        </ComponentShell>
    </div>
</template>
