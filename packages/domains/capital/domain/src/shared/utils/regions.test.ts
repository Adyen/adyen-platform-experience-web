import { describe, expect, test, vi } from 'vitest';
import localSupportedRegions from '../../config/supportedRegions.json';
import { getSupportedRegions } from './regions';

describe('getSupportedRegions', () => {
    test('loads supported regions from CDN', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(['NL']);
        await expect(getSupportedRegions(getCdnConfig)).resolves.toEqual(['NL']);
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'supportedRegions',
            fallback: localSupportedRegions,
        });
    });

    test('uses bundled supported regions when CDN returns no config', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(undefined);
        await expect(getSupportedRegions(getCdnConfig)).resolves.toEqual(localSupportedRegions);
    });

    test('uses bundled supported regions when no CDN fetcher is available', async () => {
        await expect(getSupportedRegions()).resolves.toEqual(localSupportedRegions);
    });
});
