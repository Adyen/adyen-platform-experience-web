import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import type { CdnFetcher } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { getArrivalTime, getArrivalTimes, LOCAL_ARRIVAL_TIMES, type CashOutArrivalTimes } from '@integration-components/cashOut/domain';

// Loaded once per CDN fetcher, so the components of a page, such as the request and its success screen, share one request.
const loadedArrivalTimes = new WeakMap<CdnFetcher, Promise<CashOutArrivalTimes>>();

const loadArrivalTimes = (getCdnConfig: CdnFetcher) => {
    let arrivalTimes = loadedArrivalTimes.get(getCdnConfig);
    if (!arrivalTimes) {
        arrivalTimes = getArrivalTimes(getCdnConfig).catch(() => LOCAL_ARRIVAL_TIMES);
        loadedArrivalTimes.set(getCdnConfig, arrivalTimes);
    }
    return arrivalTimes;
};

/**
 * When a cashOut in the currency usually arrives, as the texts that tell it take it: "within 5 minutes", "in less than a minute".
 * The bundled arrival times apply until the CDN gives its own.
 */
export const useArrivalTime = (currency: MaybeRefOrGetter<string | undefined>) => {
    const { getCdnConfig, i18n } = useCoreContext();
    const arrivalTimes = ref<CashOutArrivalTimes>(LOCAL_ARRIVAL_TIMES);

    if (getCdnConfig) {
        void loadArrivalTimes(getCdnConfig).then(loaded => {
            arrivalTimes.value = loaded;
        });
    }

    return computed(() => {
        const arrivalTime = getArrivalTime(arrivalTimes.value, toValue(currency));
        return 'count' in arrivalTime
            ? i18n.get(arrivalTime.key, { values: { count: arrivalTime.count }, count: arrivalTime.count })
            : i18n.get(arrivalTime.key);
    });
};
