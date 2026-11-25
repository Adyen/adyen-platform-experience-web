<script setup lang="ts">
import { ref } from 'vue';
import { BentoButton, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { ComponentShell, useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutResponse } from '@integration-components/types';
import type { CashOutOverviewComponentProps } from '../../types';
import { CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY, provideCashOutAnalytics } from '../../../shared/composables/useCashOutAnalytics';
import { useCashOutLoadAnalytics } from '../../../shared/composables/useCashOutLoadAnalytics';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import { useFormatAmount } from '../../../shared/composables/useFormatAmount';
import { useCashOutTooltips } from '../../../shared/composables/useCashOutTooltips';
import CashOutHeader from '../../../shared/CashOutHeader/CashOutHeader.vue';
import UnavailableReasonAlert from '../../../shared/UnavailableReasonAlert/UnavailableReasonAlert.vue';
import CashOutOverviewSkeleton from '../CashOutOverviewSkeleton/CashOutOverviewSkeleton.vue';
import CashOutRequestModal from '../CashOutRequestModal/CashOutRequestModal.vue';
import styles from './CashOutOverview.module.scss';

const props = defineProps<CashOutOverviewComponentProps>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();
const formatAmount = useFormatAmount();
const { availableForCashOutTooltip } = useCashOutTooltips();

const {
    balanceAccountOptions,
    eligibility,
    errorInfo,
    isFetchingEligibility,
    lastUpdated,
    loadingError,
    recordCashOut,
    refresh,
    refreshAvailableAmounts,
    refreshEligibility,
    selectedBalanceAccountId,
    shellState,
} = useCashOutState();

const analytics = provideCashOutAnalytics({ category: CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY, subCategory: 'Overview' });
useCashOutLoadAnalytics(analytics, { eligibility, balanceAccountCount: () => balanceAccountOptions.value.length, loadingError });

const isRequestModalOpen = ref(false);
let hasInstructedCashOut = false;

const openRequestModal = () => {
    analytics.track('Clicked button', { label: 'Start instant CashOut' });
    isRequestModalOpen.value = true;
};

const handleSubmit = (cashOut: ICashOutResponse) => {
    hasInstructedCashOut = true;
    props.onSubmit?.(cashOut);
    recordCashOut(cashOut);
};

// Refreshed on close rather than on success, so the success screen doesn't change while it's open.
const closeRequestModal = () => {
    isRequestModalOpen.value = false;
    if (!hasInstructedCashOut) return;
    hasInstructedCashOut = false;
    refreshEligibility();
};
</script>

<template>
    <div :class="styles.root">
        <CashOutHeader
            v-model:selected-balance-account-id="selectedBalanceAccountId"
            :balance-account-options="balanceAccountOptions"
            :hide-title="hideTitles"
            title-key="cashOut.overview.title"
            :last-updated="lastUpdated"
            :is-refreshing="isFetchingEligibility"
            :on-refresh="shellState === 'error' ? undefined : refresh"
            :on-balance-account-selector-close="refreshAvailableAmounts"
        />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutOverviewSkeleton />
            </template>
            <div v-if="eligibility" :class="styles.content">
                <!-- What is available, with why it can't be cashed out right under it. -->
                <div :class="styles.balance">
                    <div :class="styles.availableForCashOut">
                        <div :class="styles.availableForCashOutLabel">
                            <BentoTypography variant="body">{{ i18n.get('cashOut.common.availableForCashOut.label') }}</BentoTypography>
                            <BentoInfoIcon :tooltip-text="availableForCashOutTooltip(eligibility.dailyLimit)" />
                        </div>
                        <BentoTypography variant="title" large>
                            {{ formatAmount(eligibility.availableForCashOutBalance) }}
                        </BentoTypography>
                    </div>
                    <UnavailableReasonAlert :eligibility="eligibility" :on-contact-support="props.onContactSupport" />
                </div>
                <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable" @click="openRequestModal">
                    {{ i18n.get('cashOut.overview.actions.start') }}
                </BentoButton>
            </div>
        </ComponentShell>
        <CashOutRequestModal
            :initial-balance-account-id="selectedBalanceAccountId"
            :reference-for-beneficiary="props.referenceForBeneficiary"
            :transfer-description="props.transferDescription"
            :eligibility="eligibility"
            :is-loading-eligibility="isFetchingEligibility"
            :is-open="isRequestModalOpen"
            :on-submit="handleSubmit"
            :on-close="closeRequestModal"
            :on-contact-support="props.onContactSupport"
            :on-try-again="refresh"
        />
    </div>
</template>
