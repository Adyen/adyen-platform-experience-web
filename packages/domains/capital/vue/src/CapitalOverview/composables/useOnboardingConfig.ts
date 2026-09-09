import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useAsyncRequest } from '@integration-components/composables-vue';
import { useConfigContext } from '@integration-components/core/vue';
import type { IOnboardingConfiguration } from '@integration-components/types';

export const useOnboardingConfig = (isEnabled: MaybeRefOrGetter<boolean>, onError: () => void) => {
    const config = useConfigContext();
    const request = useAsyncRequest<IOnboardingConfiguration>();
    const getOnboardingConfiguration = computed(() => config.endpoints.getOnboardingConfiguration);

    watch(
        [() => toValue(isEnabled), getOnboardingConfiguration],
        ([enabled, endpoint]) => {
            request.abort();

            if (!enabled || !endpoint) {
                return;
            }

            void request.execute(signal => endpoint({ signal }));
        },
        { immediate: true }
    );

    watch(request.error, error => {
        if (error) {
            onError();
        }
    });

    return {
        isFetchingOnboardingConfiguration: request.isLoading,
        onboardingConfiguration: request.data,
    } as const;
};
