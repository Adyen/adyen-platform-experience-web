import { useCallback, useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../core/Context/useCoreContext';
import localPollingConfig from './pollingConfig.json';

export type PollingStrategy = 'fixed' | 'exponentialBackoff';

export interface MissingActionsPollingConfig {
    initialIntervalMs: number;
    backoffMultiplier: number;
    maxDurationMs: number;
    strategy: PollingStrategy;
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
