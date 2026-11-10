<script setup lang="ts">
import { ref } from 'vue';
import { BentoButton, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { ComponentShell, useShouldHideTitles } from '@integration-components/composables-vue';
import { CashOutOverviewProps } from '../../types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import UnavailableReasonAlert from '../../../shared/UnavailableReasonAlert/UnavailableReasonAlert.vue';
import CashOutOverviewSkeleton from '../CashOutOverviewSkeleton/CashOutOverviewSkeleton.vue';
import CashOutRequestModal from '../CashOutRequestModal/CashOutRequestModal.vue';
import styles from './CashOutOverview.module.scss';

const props = defineProps<CashOutOverviewProps>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();

const { balanceAccountOptions, eligibility, errorInfo, selectedBalanceAccountId, shellState } = useCashOutState();

const isRequestModalOpen = ref(false);

const openRequestModal = () => {
    isRequestModalOpen.value = true;
};

const closeRequestModal = () => {
    isRequestModalOpen.value = false;
};
</script>

<template>
    <div :class="styles.root">
        <CashOutHeader
            v-model:selected-balance-account-id="selectedBalanceAccountId"
            :balance-account-options="balanceAccountOptions"
            :hide-title="hideTitles"
            title-key="cashOut.overview.title"
        />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutOverviewSkeleton />
            </template>
            <div v-if="eligibility" :class="styles.content">
                <div :class="styles.availableForCashOut">
                    <div :class="styles.availableForCashOutLabel">
                        <BentoTypography variant="body">{{ i18n.get('cashOut.common.availableForCashOut.label') }}</BentoTypography>
                        <BentoInfoIcon :tooltip-text="i18n.get('cashOut.common.availableForCashOut.tooltip')" />
                    </div>
                    <BentoTypography variant="title" large>
                        {{ i18n.amount(eligibility.availableForCashOutBalance.value, eligibility.availableForCashOutBalance.currency) }}
                    </BentoTypography>
                </div>
                <UnavailableReasonAlert :eligibility="eligibility" :on-contact-support="props.onContactSupport" />
                <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable" @click="openRequestModal">
                    {{ i18n.get('cashOut.overview.actions.start') }}
                </BentoButton>
            </div>
        </ComponentShell>
        <CashOutRequestModal
            :balance-account-id="selectedBalanceAccountId"
            :eligibility="eligibility"
            :is-open="isRequestModalOpen"
            :on-close="closeRequestModal"
            :on-contact-support="props.onContactSupport"
        />
    </div>
</template>
