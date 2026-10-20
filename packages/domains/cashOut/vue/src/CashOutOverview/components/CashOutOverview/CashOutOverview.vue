<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton, BentoHeader, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import type { AdyenPlatformExperienceError, TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { getCashOutErrorMessage } from '@integration-components/cashOut/domain';
import {
    ComponentShell,
    useBalanceAccountFilterState,
    useBalanceAccounts,
    useShouldHideTitles,
    type ComponentShellState,
    type ErrorMessageInfo,
} from '@integration-components/composables-vue';
import type { ICashOutUnavailableReason } from '@integration-components/types';
import { CashOutOverviewProps } from '../../types';
import { useCashOutEligibility } from '../../composables/useCashOutEligibility';
import BalanceAccountSelector from '../BalanceAccountSelector/BalanceAccountSelector.vue';
import CashOutOverviewSkeleton from '../CashOutOverviewSkeleton/CashOutOverviewSkeleton.vue';
import styles from './CashOutOverview.module.scss';

// A zero balance already shows as an amount of 0, so it gets no alert.
const UNAVAILABLE_REASON_MESSAGES = {
    zeroBalance: undefined,
    noInstantReachableTransferInstruments: 'cashOut.overview.unavailableReasons.noInstantReachableTransferInstruments',
    cashOutInProgress: 'cashOut.overview.unavailableReasons.cashOutInProgress',
    dailyLimitReached: 'cashOut.overview.unavailableReasons.dailyLimitReached',
    sendToBalanceAccountNotAllowed: 'cashOut.overview.unavailableReasons.notAllowed',
    receiveFromBalanceAccountNotAllowed: 'cashOut.overview.unavailableReasons.notAllowed',
    riskRestricted: 'cashOut.overview.unavailableReasons.riskRestricted',
    cashOutNotConfigured: 'cashOut.overview.unavailableReasons.notAllowed',
} as const satisfies Record<ICashOutUnavailableReason, TranslationKey | undefined>;

type UnavailableReasonMessage = NonNullable<(typeof UNAVAILABLE_REASON_MESSAGES)[ICashOutUnavailableReason]>;

// Messages that ask the user to contact support, so the alert offers the contact support action.
const SUPPORT_REASON_MESSAGES = new Set<UnavailableReasonMessage>(['cashOut.overview.unavailableReasons.notAllowed']);

const props = defineProps<CashOutOverviewProps>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();

const { balanceAccounts, error: balanceAccountsError, isFetching: isFetchingBalanceAccounts } = useBalanceAccounts();
const { balanceAccountOptions, selectedBalanceAccountId } = useBalanceAccountFilterState({
    balanceAccounts: () => balanceAccounts.value,
});
const { eligibility, eligibilityError, isFetchingEligibility } = useCashOutEligibility(selectedBalanceAccountId);

// The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
const error = computed(() => (balanceAccountsError.value ?? eligibilityError.value) as AdyenPlatformExperienceError | undefined);

// Without a balance account there is nothing to request eligibility for, so the shell would otherwise stay loading.
const hasNoBalanceAccounts = computed(() => !isFetchingBalanceAccounts.value && !balanceAccountsError.value && !balanceAccounts.value?.length);

const errorInfo = computed<ErrorMessageInfo>(() => getCashOutErrorMessage(error.value));

const shellState = computed<ComponentShellState>(() => {
    if (error.value || hasNoBalanceAccounts.value) return 'error';
    if (isFetchingBalanceAccounts.value || isFetchingEligibility.value || !eligibility.value) return 'loading';
    return 'ready';
});

const unavailableReasonMessage = computed<UnavailableReasonMessage | undefined>(() => {
    if (!eligibility.value || eligibility.value.isCashoutAvailable) return undefined;
    const [reason] = eligibility.value.unavailableReasons;
    // The backend always sends a reason when cashOut is unavailable; the generic message covers it if it doesn't.
    return reason ? UNAVAILABLE_REASON_MESSAGES[reason] : 'cashOut.overview.unavailableReasons.notAllowed';
});

const showUnavailableReasonContactSupport = computed(() =>
    Boolean(unavailableReasonMessage.value && SUPPORT_REASON_MESSAGES.has(unavailableReasonMessage.value) && props.onContactSupport)
);
</script>

<template>
    <div :class="styles.root">
        <div v-if="!hideTitles" :class="styles.header">
            <BentoHeader variant="component" :title="i18n.get('cashOut.overview.title')" />
            <BalanceAccountSelector v-model="selectedBalanceAccountId" :options="balanceAccountOptions" />
        </div>
        <!-- Outside the shell so another balance account can still be selected when one fails to load. -->
        <BalanceAccountSelector v-else v-model="selectedBalanceAccountId" :options="balanceAccountOptions" />
        <ComponentShell :state="shellState" :error-info="errorInfo">
            <template #loading>
                <CashOutOverviewSkeleton />
            </template>
            <div v-if="eligibility" :class="styles.content">
                <div :class="styles.availableForCashOut">
                    <div :class="styles.availableForCashOutLabel">
                        <BentoTypography variant="body">{{ i18n.get('cashOut.overview.availableForCashOut.label') }}</BentoTypography>
                        <BentoInfoIcon :tooltip-text="i18n.get('cashOut.overview.availableForCashOut.tooltip')" />
                    </div>
                    <BentoTypography variant="title" large>
                        {{ i18n.amount(eligibility.availableForCashOutBalance.value, eligibility.availableForCashOutBalance.currency) }}
                    </BentoTypography>
                </div>
                <BentoAlert v-if="unavailableReasonMessage" type="warning" role="status">
                    <template #description>{{ i18n.get(unavailableReasonMessage) }}</template>
                    <template v-if="showUnavailableReasonContactSupport" #actions>
                        <BentoButton variant="tertiary" @click="props.onContactSupport">
                            {{ i18n.get('cashOut.common.actions.contactSupport.labels.reachOut') }}
                        </BentoButton>
                    </template>
                </BentoAlert>
                <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable">
                    {{ i18n.get('cashOut.overview.actions.start') }}
                </BentoButton>
            </div>
        </ComponentShell>
    </div>
</template>
