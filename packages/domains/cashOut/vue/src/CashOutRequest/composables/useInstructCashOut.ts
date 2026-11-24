import { computed } from 'vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import { useConfigContext } from '@integration-components/core/vue';
import { useAsyncRequest } from '@integration-components/composables-vue/useAsyncRequest';
import type { ICashOutAmount, ICashOutResponse } from '@integration-components/types';
import { useReportErrors } from '../../shared/composables/useReportErrors';

type InstructCashOutParams = {
    /** The account key of the balance account, as the balance accounts endpoint returns it. */
    accountKey: string;
    amount: ICashOutAmount;
    /**
     * The fee the fees endpoint returned for `amount`, in its minor units. The API calculates the fee again, and rejects the cashOut when
     * it differs: the fee configuration changed since, so the user would be charged another fee than the one shown.
     */
    expectedFee: number;
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
        accountKey,
        amount,
        expectedFee,
        transferInstrumentId,
        referenceForBeneficiary,
        transferDescription,
    }: InstructCashOutParams) => {
        const endpoint = instructCashOutEndpoint.value;
        if (!endpoint) return undefined;
        return request.execute(signal =>
            endpoint(
                {
                    body: {
                        amount: amount.value,
                        currency: amount.currency,
                        expectedFee,
                        counterparty: { transferInstrumentId },
                        // Left out of the request when not given (JSON drops undefined), so the API generates them.
                        description: transferDescription || undefined,
                        referenceForBeneficiary: referenceForBeneficiary || undefined,
                    },
                    contentType: 'application/json',
                    signal,
                },
                { path: { accountKey } }
            )
        );
    };

    return {
        canInstructCashOut: computed(() => !!instructCashOutEndpoint.value),
        instructCashOut,
        // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composable declares.
        instructError: computed(() => request.error.value as AdyenPlatformExperienceError | undefined),
        isInstructing: request.isLoading,
    } as const;
};
