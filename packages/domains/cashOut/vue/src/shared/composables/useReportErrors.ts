import { toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';

/**
 * Reports each error of a request to the onError set on Core, when it happens. Only failed requests are errors: an unavailable
 * cashOut or account is an answer of the API, shown in the component, and not reported.
 */
export const useReportErrors = (error: MaybeRefOrGetter<unknown>) => {
    const core = useCoreContext();

    // Synchronous, so the error is reported before the component shows it.
    watch(
        () => toValue(error),
        currentError => {
            // The HTTP layer throws AdyenPlatformExperienceError at runtime, whatever type the request composables declare.
            if (currentError) core.externalErrorHandler?.(currentError as Error);
        },
        { flush: 'sync' }
    );
};
