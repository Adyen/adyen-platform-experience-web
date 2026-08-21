import type { CdnFetcher } from '@integration-components/core';
import localSupportedRegions from '../config/supportedRegions.json';

export type SupportedRegions = string[];

export const getSupportedRegions = async (getCdnConfig?: CdnFetcher): Promise<SupportedRegions> => {
    const config = await getCdnConfig?.<SupportedRegions>({
        subFolder: 'capital',
        name: 'supportedRegions',
        fallback: localSupportedRegions,
    });

    return config ?? localSupportedRegions;
};
