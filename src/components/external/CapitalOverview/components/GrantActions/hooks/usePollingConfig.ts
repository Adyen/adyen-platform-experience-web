import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import localPollingConfig from '../../../../../../config/capital/pollingConfig.json';

// The following structure enables us to have polling with exponential backoff intervals. If the `backoffMultiplier` is 1, the polling will happen on fixed intervals.
export interface MissingActionsPollingConfig {
    initialIntervalMs: number;
    backoffMultiplier: number;
    maxDurationMs: number;
}

export interface PollingConfig {
    missingActions: MissingActionsPollingConfig;
}

export const usePollingConfig = () => {
    const { getCdnConfig } = useCoreContext();
    const localConfig = localPollingConfig as unknown as PollingConfig;
    const [pollingConfig, setPollingConfig] = useState<PollingConfig>(localConfig);

    const getPollingConfig = useCallback(async () => {
        const config = await getCdnConfig?.<PollingConfig>({
            subFolder: 'capital',
            name: 'pollingConfig',
            fallback: localConfig,
        });
        setPollingConfig(config ?? localConfig);
    }, [getCdnConfig, localConfig]);

    useEffect(() => {
        void getPollingConfig();
    }, [getPollingConfig]);

    return {
        pollingConfig,
        getPollingConfig,
    };
};
