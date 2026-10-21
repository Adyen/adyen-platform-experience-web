<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoHeader, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import {
    ComponentShell,
    useBalanceAccountFilterState,
    useBalanceAccounts,
    useShouldHideTitles,
    type ComponentShellState,
    type ErrorMessageInfo,
} from '@integration-components/composables-vue';
import { CashOutOverviewProps } from '../../types';
import { useCashOutEligibility } from '../../composables/useCashOutEligibility';
import BalanceAccountSelector from '../BalanceAccountSelector/BalanceAccountSelector.vue';
import CashOutOverviewSkeleton from '../CashOutOverviewSkeleton/CashOutOverviewSkeleton.vue';
import styles from './CashOutOverview.module.scss';

const props = defineProps<CashOutOverviewProps>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();

const { balanceAccounts, error: balanceAccountsError, isFetching: isFetchingBalanceAccounts } = useBalanceAccounts();
const { balanceAccountOptions, hasMultipleBalanceAccounts, selectedBalanceAccountId } = useBalanceAccountFilterState({
    balanceAccounts: () => balanceAccounts.value,
});
const { eligibility, eligibilityError, isFetchingEligibility } = useCashOutEligibility(selectedBalanceAccountId);

const error = computed(() => balanceAccountsError.value ?? eligibilityError.value);

// Without a balance account there is nothing to request eligibility for, so the shell would otherwise stay loading.
const hasNoBalanceAccounts = computed(() => !isFetchingBalanceAccounts.value && !balanceAccountsError.value && !balanceAccounts.value?.length);

const noBalanceAccountsErrorInfo = computed<ErrorMessageInfo | undefined>(() =>
    hasNoBalanceAccounts.value
        ? {
              title: 'cashOut.common.errors.somethingWentWrong',
              messages: ['cashOut.overview.errors.unavailable'],
              onContactSupport: props.onContactSupport,
          }
        : undefined
);

const shellState = computed<ComponentShellState>(() => {
    if (error.value || hasNoBalanceAccounts.value) return 'error';
    if (isFetchingBalanceAccounts.value || isFetchingEligibility.value || !eligibility.value) return 'loading';
    return 'ready';
});

const showAvailableForCashOutLabel = computed(() => shellState.value !== 'error');
// With titles hidden the selector moves next to the label, so it must stay reachable when one account fails to load.
const showSummaryHeader = computed(() => showAvailableForCashOutLabel.value || (hideTitles.value && hasMultipleBalanceAccounts.value));
</script>

<template>
    <div :class="styles.root">
        <div v-if="!hideTitles" :class="styles.header">
            <BentoHeader variant="component" :title="i18n.get('cashOut.overview.title')" />
            <BalanceAccountSelector v-model="selectedBalanceAccountId" :options="balanceAccountOptions" />
        </div>
        <div :class="styles.summary">
            <div v-if="showSummaryHeader" :class="styles.summaryHeader">
                <div v-if="showAvailableForCashOutLabel" :class="styles.availableForCashOutLabel">
                    <BentoTypography variant="body">{{ i18n.get('cashOut.overview.availableForCashOut.label') }}</BentoTypography>
                    <BentoInfoIcon :tooltip-text="i18n.get('cashOut.overview.availableForCashOut.tooltip')" />
                </div>
                <BalanceAccountSelector
                    v-if="hideTitles"
                    v-model="selectedBalanceAccountId"
                    :class="styles.summaryHeaderSelector"
                    :options="balanceAccountOptions"
                />
            </div>
            <ComponentShell
                :state="shellState"
                :error-info="noBalanceAccountsErrorInfo"
                :error="error"
                error-message="cashOut.overview.errors.unavailable"
                :on-contact-support="props.onContactSupport"
            >
                <template #loading>
                    <CashOutOverviewSkeleton />
                </template>
                <div v-if="eligibility" :class="styles.content">
                    <BentoTypography variant="title" large>
                        {{ i18n.amount(eligibility.availableForCashOutBalance.value, eligibility.availableForCashOutBalance.currency) }}
                    </BentoTypography>
                    <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable">
                        {{ i18n.get('cashOut.overview.actions.start') }}
                    </BentoButton>
                </div>
            </ComponentShell>
        </div>
    </div>
</template>
