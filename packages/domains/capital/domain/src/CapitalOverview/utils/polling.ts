import type { CdnFetcher } from '@integration-components/core';
import localPollingConfig from '../../config/pollingConfig.json';

export type MissingActionsPollingConfig = {
    initialIntervalMs: number;
    backoffMultiplier: number;
    maxDurationMs: number;
};

export type PollingConfig = {
    missingActions: MissingActionsPollingConfig;
};

export const DEFAULT_POLLING_CONFIG = localPollingConfig as PollingConfig;

export const getPollingConfig = async (getCdnConfig?: CdnFetcher): Promise<PollingConfig> => {
    const config = await getCdnConfig?.<PollingConfig>({
        subFolder: 'capital',
        name: 'pollingConfig',
        fallback: localPollingConfig,
    });

    return config ?? DEFAULT_POLLING_CONFIG;
};
