import { describe, expect, test, vi } from 'vitest';
import localSupportedRegions from '../../../../domain/src/config/supportedRegions.json';
import { getSupportedRegions } from './getSupportedRegions';

describe('getSupportedRegions', () => {
    test('loads the supported regions from the capital CDN config', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(['NL']);

        await expect(getSupportedRegions(getCdnConfig)).resolves.toEqual(['NL']);
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'supportedRegions',
            fallback: localSupportedRegions,
        });
    });

    test('uses the bundled regions when no CDN fetcher is available', async () => {
        await expect(getSupportedRegions()).resolves.toEqual(localSupportedRegions);
    });
});
