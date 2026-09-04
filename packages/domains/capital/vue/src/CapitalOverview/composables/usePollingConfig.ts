import { ref } from 'vue';
import { DEFAULT_POLLING_CONFIG, getPollingConfig as getDomainPollingConfig, type PollingConfig } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';

export const usePollingConfig = () => {
    const { getCdnConfig } = useCoreContext();
    const pollingConfig = ref<PollingConfig>(DEFAULT_POLLING_CONFIG);

    const fetchPollingConfig = async () => {
        try {
            pollingConfig.value = await getDomainPollingConfig(getCdnConfig);
        } catch {
            // Fallback to DEFAULT_POLLING_CONFIG is already set initially
        }
    };

    return { fetchPollingConfig, pollingConfig };
};
