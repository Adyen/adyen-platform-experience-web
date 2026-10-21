import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { getCashOutErrorMessage } from '@integration-components/cashOut/domain';
import type { ComponentShellState, ErrorMessageInfo } from '@integration-components/composables-vue';
import { useBalanceAccountFilterState } from '@integration-components/composables-vue/useBalanceAccountFilterState';
import { useBalanceAccounts } from '@integration-components/composables-vue/useBalanceAccounts';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutEligibility } from './useCashOutEligibility';

type CashOutStateOptions = {
    /** The balance account selected initially. */
    balanceAccountId?: MaybeRefOrGetter<string | undefined>;
    /** The eligibility of `balanceAccountId`, already loaded elsewhere, so it isn't fetched again. */
    eligibility?: MaybeRefOrGetter<ICashOutEligibility | undefined>;
};

/** The balance accounts, the selected one and its eligibility, with the component shell state they result in. */
export const useCashOutState = ({ balanceAccountId, eligibility: givenEligibility }: CashOutStateOptions = {}) => {
    const { balanceAccounts, error: balanceAccountsError, isFetching: isFetchingBalanceAccounts } = useBalanceAccounts();
    const { balanceAccountOptions, selectedBalanceAccountId } = useBalanceAccountFilterState({
        balanceAccounts: () => balanceAccounts.value,
        initialValue: toValue(balanceAccountId),
    });

    const usesGivenEligibility = computed(() => !!toValue(givenEligibility) && selectedBalanceAccountId.value === toValue(balanceAccountId));

    const {
        eligibility: fetchedEligibility,
        eligibilityError,
        isFetchingEligibility,
    } = useCashOutEligibility(() => (usesGivenEligibility.value ? undefined : selectedBalanceAccountId.value));

    const eligibility = computed(() => (usesGivenEligibility.value ? toValue(givenEligibility) : fetchedEligibility.value));

    // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
    const error = computed(() => (balanceAccountsError.value ?? eligibilityError.value) as AdyenPlatformExperienceError | undefined);

    // Without a balance account there is nothing to request eligibility for, so the shell would otherwise stay loading.
    const hasNoBalanceAccounts = computed(() => !isFetchingBalanceAccounts.value && !balanceAccountsError.value && !balanceAccounts.value?.length);

    // The domain types its keys as any `cashOut.` string, which is wider than the generated translation key union.
    const errorInfo = computed(() => getCashOutErrorMessage(error.value) as ErrorMessageInfo);

    const shellState = computed<ComponentShellState>(() => {
        if (error.value || hasNoBalanceAccounts.value) return 'error';
        if (isFetchingBalanceAccounts.value || isFetchingEligibility.value || !eligibility.value) return 'loading';
        return 'ready';
    });

    return { balanceAccountOptions, eligibility, errorInfo, selectedBalanceAccountId, shellState } as const;
};
