import { computed, onUnmounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { DYNAMIC_OFFER_DEBOUNCE_MS, DYNAMIC_OFFER_RETRY_COUNT } from '@integration-components/capital/domain';
import type { IDynamicOffersConfig, IGrantOffersResponseDTO } from '@integration-components/types';
import { useAsyncRequest } from '@integration-components/composables-vue';

export function useOffers(dynamicOfferConfig: MaybeRefOrGetter<IDynamicOffersConfig>, amount: MaybeRefOrGetter<number | undefined>) {
    const config = useConfigContext();
    const requestState = useAsyncRequest<IGrantOffersResponseDTO>();
    const getDynamicGrantOffer = computed(() => config.endpoints.getDynamicGrantOffer);
    const isPending = ref(false);
    const debounceTimeout = ref<ReturnType<typeof setTimeout>>();
    let hasInitialized = false;

    const cancelPendingRequest = () => {
        clearTimeout(debounceTimeout.value);
        debounceTimeout.value = undefined;
        isPending.value = false;
    };

    const cancelRequest = () => {
        cancelPendingRequest();
        requestState.abort();
    };

    const sendGetDynamicGrantOfferRequest = async (amountValue: number): Promise<void> => {
        const config = toValue(dynamicOfferConfig);
        const request = getDynamicGrantOffer.value;
        if (!config || !request) return;

        isPending.value = false;
        await requestState.execute(
            signal =>
                request(
                    { signal },
                    {
                        query: {
                            amount: amountValue,
                            currency: config.minAmount.currency,
                        },
                    }
                ),
            {
                retries: DYNAMIC_OFFER_RETRY_COUNT,
                shouldRetry: error => error.status === 500,
            }
        );
    };

    const debounceGetDynamicGrantOfferRequest = (amountValue: number) => {
        cancelPendingRequest();
        isPending.value = true;
        debounceTimeout.value = setTimeout(() => {
            void sendGetDynamicGrantOfferRequest(amountValue);
        }, DYNAMIC_OFFER_DEBOUNCE_MS);
    };

    watch(
        [() => toValue(dynamicOfferConfig), () => toValue(amount)],
        ([config, selectedAmount]) => {
            if (hasInitialized || !config || selectedAmount === undefined) return;

            hasInitialized = true;
            void sendGetDynamicGrantOfferRequest(selectedAmount);
        },
        { immediate: true }
    );

    onUnmounted(cancelPendingRequest);

    return {
        cancelRequest,
        data: requestState.data,
        error: requestState.error,
        isLoading: requestState.isLoading,
        isRequestPending: isPending,
        requestOffers: debounceGetDynamicGrantOfferRequest,
    } as const;
}
