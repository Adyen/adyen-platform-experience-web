import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import {
    getAvailableAfterCashOut,
    getCashOutErrorMessage,
    hasCaughtUpWithExpectedAmount,
    withExpectedAmount,
    withExpectedAvailableForCashOut,
    withoutUnreachableCashOut,
    type CashOutBalanceAccount,
} from '@integration-components/cashOut/domain';
import type { ComponentShellState, ErrorMessageInfo } from '@integration-components/composables-vue';
import { useBalanceAccountFilterState } from '@integration-components/composables-vue/useBalanceAccountFilterState';
import { useBalanceAccounts } from '@integration-components/composables-vue/useBalanceAccounts';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutAmount, ICashOutEligibility, ICashOutResponse } from '@integration-components/types';
import { useCashOutAvailableAmounts } from './useCashOutAvailableAmounts';
import { useCashOutEligibility } from './useCashOutEligibility';
import { useFormatAmount } from './useFormatAmount';
import { useReportErrors } from './useReportErrors';

type CashOutStateOptions = {
    /** The balance account selected initially, which can then be switched. */
    initialBalanceAccountId?: MaybeRefOrGetter<string | undefined>;
    /** The eligibility of `initialBalanceAccountId`, already loaded elsewhere, so it isn't fetched again. */
    eligibility?: MaybeRefOrGetter<ICashOutEligibility | undefined>;
};

export const getCashOutErrorInfo = (error: AdyenPlatformExperienceError | undefined): ErrorMessageInfo => getCashOutErrorMessage(error);

// How long the API locks a balance account at most while it processes a cashOut (getLockReleaseDate in cashout's
// CashOutAccountLockService).
const CASH_OUT_PROCESSING_LIMIT_MS = 10 * 60 * 1000;

/** The balance accounts, the selected one and its eligibility, with the component shell state they result in. */
export const useCashOutState = ({ initialBalanceAccountId, eligibility: givenEligibility }: CashOutStateOptions = {}) => {
    const { i18n } = useCoreContext();
    const formatAmount = useFormatAmount();
    const { balanceAccounts, error: balanceAccountsError, isFetching: isFetchingBalanceAccounts } = useBalanceAccounts();
    const { availableAmounts, hasAvailableAmounts, refreshAvailableAmounts } = useCashOutAvailableAmounts();
    const { balanceAccountOptions: filterOptions, selectedBalanceAccountId } = useBalanceAccountFilterState({
        balanceAccounts: () => balanceAccounts.value,
        initialValue: toValue(initialBalanceAccountId),
    });

    // The cashOut endpoints take the account key the balance accounts endpoint returns for the selected balance account.
    const selectedAccountKey = computed(
        () => (balanceAccounts.value as CashOutBalanceAccount[] | undefined)?.find(({ id }) => id === selectedBalanceAccountId.value)?.accountKey
    );

    const usesGivenEligibility = computed(() => !!toValue(givenEligibility) && selectedBalanceAccountId.value === toValue(initialBalanceAccountId));

    const {
        eligibility: fetchedEligibility,
        eligibilityError,
        isFetchingEligibility,
        lastUpdated,
        refreshEligibility,
    } = useCashOutEligibility(() => (usesGivenEligibility.value ? undefined : selectedAccountKey.value));

    // What each balance account is expected to have available after its cashOuts, until it is refreshed: right after a cashOut the
    // API still shows what was available before it.
    const expectedAvailableForCashOut = ref<Record<string, ICashOutAmount>>({});
    const expectedOf = (balanceAccountId: string | undefined) => (balanceAccountId ? expectedAvailableForCashOut.value[balanceAccountId] : undefined);

    // When each expectation was recorded, to tell when the API has surely processed its cashOut.
    const expectedSince: Record<string, number> = {};
    const forgetExpected = (balanceAccountId: string) => {
        delete expectedAvailableForCashOut.value[balanceAccountId];
        delete expectedSince[balanceAccountId];
    };

    // Once the API has the cashOut, what it shows counts again, also when that is more than expected: money that came in since. It has
    // the cashOut once it shows no more than expected, or once it no longer processes it: the eligibility then no longer tells a
    // cashOut is in progress, and the API locks the balance account for at most CASH_OUT_PROCESSING_LIMIT_MS meanwhile.
    watch(fetchedEligibility, fetched => {
        const balanceAccountId = selectedBalanceAccountId.value;
        if (!balanceAccountId || !fetched || !expectedOf(balanceAccountId)) return;
        const isProcessing = fetched.unavailableReasons.includes('cashOutInProgress');
        if (!isProcessing || hasCaughtUpWithExpectedAmount(fetched.availableForCashOutBalance, expectedOf(balanceAccountId))) {
            forgetExpected(balanceAccountId);
        }
    });
    // The available amounts don't tell whether a cashOut is in progress.
    watch(availableAmounts, amounts =>
        amounts.forEach((amount, balanceAccountId) => {
            const expected = expectedOf(balanceAccountId);
            if (!expected) return;
            const isSurelyProcessed = Date.now() - (expectedSince[balanceAccountId] ?? 0) >= CASH_OUT_PROCESSING_LIMIT_MS;
            if (isSurelyProcessed || hasCaughtUpWithExpectedAmount(amount, expected)) forgetExpected(balanceAccountId);
        })
    );

    const eligibility = computed(() =>
        withExpectedAvailableForCashOut(
            withoutUnreachableCashOut(usesGivenEligibility.value ? toValue(givenEligibility) : fetchedEligibility.value),
            expectedOf(selectedBalanceAccountId.value)
        )
    );

    /**
     * Remembers what the balance account of the cashOut is expected to have left after it. That may not be the selected one, as the
     * request opened from the overview can switch balance account. Without knowing what it had, nothing is expected.
     */
    const recordCashOut = (cashOut: ICashOutResponse) => {
        const balanceAccountId = cashOut.balanceAccount;
        const availableBefore =
            balanceAccountId === selectedBalanceAccountId.value
                ? eligibility.value?.availableForCashOutBalance
                : withExpectedAmount(availableAmounts.value.get(balanceAccountId), expectedOf(balanceAccountId));
        if (!availableBefore) return;
        expectedAvailableForCashOut.value[balanceAccountId] = getAvailableAfterCashOut(availableBefore, cashOut.amount);
        expectedSince[balanceAccountId] = Date.now();
    };

    /**
     * Loads what the API shows for the selected balance account again. The amounts of all of them are loaded again with
     * `refreshAvailableAmounts` instead, once the list of balance accounts closes, so an open list keeps what it opened with.
     */
    const refresh = () => {
        if (selectedBalanceAccountId.value) forgetExpected(selectedBalanceAccountId.value);
        refreshEligibility();
    };

    // Shown only once the amounts arrived, so the selected balance account never has one while the others have none. The selected one
    // then shows what its eligibility shows, so the dropdown and the component agree.
    const availableAmountOf = (balanceAccountId: string) => {
        if (!hasAvailableAmounts.value) return undefined;
        return balanceAccountId === selectedBalanceAccountId.value && eligibility.value
            ? eligibility.value.availableForCashOutBalance
            : withExpectedAmount(availableAmounts.value.get(balanceAccountId), expectedOf(balanceAccountId));
    };

    // A named balance account has its id under its name, so the amount goes after the id.
    const balanceAccountOptions = computed(() =>
        filterOptions.value.map(option => {
            const amount = availableAmountOf(option.value);
            if (!amount) return option;
            const values = { amount: formatAmount(amount) };
            return {
                ...option,
                description: option.description
                    ? i18n.get('cashOut.common.balanceAccount.availableForCashOutWithId', {
                          values: { balanceAccountId: option.description, ...values },
                      })
                    : i18n.get('cashOut.common.balanceAccount.availableForCashOut', { values }),
            };
        })
    );

    // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
    const error = computed(() => (balanceAccountsError.value ?? eligibilityError.value) as AdyenPlatformExperienceError | undefined);
    useReportErrors(error);

    // Without a balance account there is nothing to request eligibility for, so the shell would otherwise stay loading.
    const hasNoBalanceAccounts = computed(() => !isFetchingBalanceAccounts.value && !balanceAccountsError.value && !balanceAccounts.value?.length);

    const errorInfo = computed(() => getCashOutErrorInfo(error.value));

    const shellState = computed<ComponentShellState>(() => {
        if (error.value || hasNoBalanceAccounts.value) return 'error';
        if (isFetchingBalanceAccounts.value || isFetchingEligibility.value || !eligibility.value) return 'loading';
        return 'ready';
    });

    return {
        balanceAccountOptions,
        eligibility,
        errorInfo,
        isFetchingEligibility,
        lastUpdated,
        recordCashOut,
        refresh,
        refreshAvailableAmounts,
        refreshEligibility,
        selectedAccountKey,
        selectedBalanceAccountId,
        shellState,
    } as const;
};
