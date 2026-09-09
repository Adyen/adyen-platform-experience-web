import { computed } from 'vue';
import { getCreateGrantOfferBody } from '@integration-components/capital/domain';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';

export function useCreateOffer() {
    const config = useConfigContext();
    const requestState = useAsyncRequest<IGrantOfferResponseDTO>();
    const createGrantOffer = computed(() => config.endpoints.createGrantOffer);

    const sendCreateGrantOfferRequest = (offer: IGrantOfferResponseDTO) => {
        const request = createGrantOffer.value;
        if (!request) return;

        return requestState.execute(signal =>
            request(
                {
                    body: getCreateGrantOfferBody(offer),
                    contentType: 'application/json',
                    signal,
                },
                { query: EMPTY_OBJECT }
            )
        );
    };

    return {
        error: requestState.error,
        isLoading: requestState.isLoading,
        createOffer: sendCreateGrantOfferRequest,
    } as const;
}
