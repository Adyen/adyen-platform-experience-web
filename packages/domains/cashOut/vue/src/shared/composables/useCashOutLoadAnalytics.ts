import { toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import { getCountBucket, getEligibilityAnalyticsProperties } from '@integration-components/cashOut/domain';
import type { ICashOutEligibility } from '@integration-components/types';
import type { CashOutAnalytics, CashOutFailedRequest } from './useCashOutAnalytics';

type CashOutLoadAnalyticsOptions = {
    eligibility: MaybeRefOrGetter<ICashOutEligibility | undefined>;
    balanceAccountCount: MaybeRefOrGetter<number>;
    loadingError: MaybeRefOrGetter<{ request: CashOutFailedRequest; error: AdyenPlatformExperienceError | undefined } | undefined>;
    /**
     * Off where another component tells the landing, such as the overview for the request in its modal. What kept it from loading
     * is told either way: the request in the modal loads on its own as well, such as for another balance account.
     */
    tracksLanding?: MaybeRefOrGetter<boolean>;
};

/**
 * What a component tells while it loads: its landing, once what the balance account can cash out is known, so it tells whether the
 * platform's users can cash out and why not; and which request kept it from loading.
 */
export const useCashOutLoadAnalytics = (
    analytics: CashOutAnalytics,
    { eligibility, balanceAccountCount, loadingError, tracksLanding = true }: CashOutLoadAnalyticsOptions
) => {
    useLandedPageEvent(
        () => {
            const loaded = toValue(eligibility);
            return analytics.getProperties({
                ...(loaded ? getEligibilityAnalyticsProperties(loaded) : {}),
                balanceAccountCount: getCountBucket(toValue(balanceAccountCount)),
            });
        },
        () => toValue(tracksLanding) && !!toValue(eligibility)
    );

    watch(
        () => toValue(loadingError),
        failure => {
            if (failure) analytics.trackBackendError(failure.request, failure.error);
        },
        // Also a failure there already, so none is missed however the requests come to fail
        { immediate: true }
    );
};
