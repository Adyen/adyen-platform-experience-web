<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoDropdown, BentoHeader, BentoInfoIcon, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import {
    ComponentShell,
    useBalanceAccountFilterState,
    useBalanceAccounts,
    useShouldHideTitles,
    type ComponentShellState,
} from '@integration-components/composables-vue';
import { CashOutOverviewProps } from '../../types';
import { useCashOutEligibility } from '../../composables/useCashOutEligibility';
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

const shellState = computed<ComponentShellState>(() => {
    if (error.value) return 'error';
    if (isFetchingBalanceAccounts.value || isFetchingEligibility.value || !eligibility.value) return 'loading';
    return 'ready';
});

const availableForCashOut = computed(() => {
    const amount = eligibility.value?.availableForCashOutBalance;
    return amount ? i18n.amount(amount.value, amount.currency) : undefined;
});

const onBalanceAccountChange = (value: string | number | { value?: string | number } | Array<unknown> | undefined) => {
    if (Array.isArray(value)) return;
    const nextValue = typeof value === 'object' && value !== null ? value.value : value;
    if (nextValue !== undefined) selectedBalanceAccountId.value = String(nextValue);
};
</script>

<template>
    <div :class="styles.root">
        <div :class="styles.header">
            <BentoHeader v-if="!hideTitles" variant="component" :title="i18n.get('cashOut.overview.title')" />
            <BentoDropdown
                v-if="hasMultipleBalanceAccounts"
                :class="styles.balanceAccountSelector"
                :aria-label="i18n.get('cashOut.overview.balanceAccount.label')"
                :placeholder="i18n.get('cashOut.overview.balanceAccount.label')"
                :items="balanceAccountOptions"
                :model-value="selectedBalanceAccountId"
                @update:model-value="onBalanceAccountChange"
            />
        </div>
        <ComponentShell
            :state="shellState"
            :error="error"
            error-message="cashOut.overview.errors.unavailable"
            :on-contact-support="props.onContactSupport"
        >
            <div v-if="eligibility" :class="styles.content">
                <div :class="styles.availableForCashOut">
                    <div :class="styles.availableForCashOutLabel">
                        <BentoTypography variant="body">{{ i18n.get('cashOut.overview.availableForCashOut.label') }}</BentoTypography>
                        <BentoInfoIcon :tooltip-text="i18n.get('cashOut.overview.availableForCashOut.tooltip')" />
                    </div>
                    <BentoTypography variant="title" large>{{ availableForCashOut }}</BentoTypography>
                </div>
                <BentoButton :class="styles.startButton" :disabled="!eligibility.isCashoutAvailable">
                    {{ i18n.get('cashOut.overview.actions.start') }}
                </BentoButton>
            </div>
        </ComponentShell>
    </div>
</template>
