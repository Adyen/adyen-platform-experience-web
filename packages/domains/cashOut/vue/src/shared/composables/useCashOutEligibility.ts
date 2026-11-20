import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutEligibility } from '@integration-components/types';

// While the API processes a cashOut it locks the balance account, for at most 10 minutes (getLockReleaseDate in cashout's
// CashOutAccountLockService), and the eligibility tells a cashOut is in progress. Once processed, the API shows the cashOut and lets
// cash out again, so the eligibility is checked again meanwhile.
const IN_PROGRESS_CHECK_INTERVAL_MS = 5000;
const IN_PROGRESS_CHECK_LIMIT_MS = 10 * 60 * 1000;

/**
 * Fetches the eligibility of the balance account with the given account key, as the balance accounts endpoint returns it. While a
 * cashOut is in progress, it is checked again in the background, keeping what is shown until the next one arrives.
 */
export const useCashOutEligibility = (accountKey: MaybeRefOrGetter<string | undefined>) => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutEligibility>();
    const getCashOutEligibility = computed(() => config.endpoints.getCashOutEligibility);
    const refreshCount = ref(0);
    const backgroundCheck = useAsyncRequest<ICashOutEligibility>();
    let checkTimer: ReturnType<typeof setTimeout> | undefined;
    let checkingSince: number | undefined;

    const stopChecking = () => {
        clearTimeout(checkTimer);
        checkTimer = undefined;
        backgroundCheck.abort();
    };
    // When the eligibility shown was loaded; it stays while the next one loads.
    const lastUpdated = ref<number>();

    watch(
        [() => toValue(accountKey), getCashOutEligibility, refreshCount],
        ([key, endpoint]) => {
            stopChecking();
            checkingSince = undefined;
            request.abort();
            // The eligibility of the previous balance account must not show while the next one loads.
            request.data.value = undefined;
            request.error.value = undefined;

            if (!key || !endpoint) return;
            void request.execute(signal => endpoint({ signal }, { path: { accountKey: key } }));
        },
        { immediate: true }
    );

    watch(request.data, eligibility => {
        if (eligibility) lastUpdated.value = Date.now();

        stopChecking();
        if (!eligibility?.unavailableReasons.includes('cashOutInProgress')) {
            checkingSince = undefined;
            return;
        }
        checkingSince ??= Date.now();
        const key = toValue(accountKey);
        const endpoint = getCashOutEligibility.value;
        if (!key || !endpoint || Date.now() - checkingSince + IN_PROGRESS_CHECK_INTERVAL_MS > IN_PROGRESS_CHECK_LIMIT_MS) return;

        checkTimer = setTimeout(() => {
            checkTimer = undefined;
            void backgroundCheck.execute(signal => endpoint({ signal }, { path: { accountKey: key } }));
        }, IN_PROGRESS_CHECK_INTERVAL_MS);
    });

    // A check that fails leaves what is shown, and the checking stops.
    watch(backgroundCheck.data, checked => {
        if (checked) request.data.value = checked;
    });

    onScopeDispose(stopChecking);

    return {
        eligibility: request.data,
        eligibilityError: request.error,
        isFetchingEligibility: request.isLoading,
        lastUpdated,
        refreshEligibility: () => refreshCount.value++,
    } as const;
};
