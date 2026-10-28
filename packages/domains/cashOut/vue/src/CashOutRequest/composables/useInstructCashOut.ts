import { computed } from 'vue';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutAmount, ICashOutResponse } from '@integration-components/types';
import { useReportErrors } from '../../shared/composables/useReportErrors';

type InstructCashOutParams = {
    balanceAccountId: string;
    amount: ICashOutAmount;
    transferInstrumentId: string;
    referenceForBeneficiary?: string;
    transferDescription?: string;
};

export const useInstructCashOut = () => {
    const config = useConfigContext();
    const request = useAsyncRequest<ICashOutResponse>();
    const instructCashOutEndpoint = computed(() => config.endpoints.instructCashOut);

    useReportErrors(request.error);

    /** Resolves with the instructed cashOut, or with `undefined` when it fails. */
    const instructCashOut = async ({
        balanceAccountId,
        amount,
        transferInstrumentId,
        referenceForBeneficiary,
        transferDescription,
    }: InstructCashOutParams) => {
        const endpoint = instructCashOutEndpoint.value;
        if (!endpoint) return undefined;

        // The cashOut endpoints take the balance account id as their account key.
        return request.execute(signal =>
            endpoint(
                {
                    body: {
                        amount: amount.value,
                        currency: amount.currency,
                        counterparty: { transferInstrumentId },
                        // Left out of the request when not given (JSON drops undefined), so the API generates them.
                        description: transferDescription || undefined,
                        referenceForBeneficiary: referenceForBeneficiary || undefined,
                    },
                    contentType: 'application/json',
                    signal,
                },
                { path: { accountKey: balanceAccountId } }
            )
        );
    };

    return {
        canInstructCashOut: computed(() => !!instructCashOutEndpoint.value),
        instructCashOut,
        isInstructing: request.isLoading,
    } as const;
};
