import { describe, expect, test, vi } from 'vitest';
import { DEFAULT_POLLING_CONFIG, getPollingConfig } from './polling';

describe('getPollingConfig', () => {
    test('returns polling configuration from CDN', async () => {
        const config = {
            missingActions: {
                initialIntervalMs: 250,
                backoffMultiplier: 1.5,
                maxDurationMs: 3000,
            },
        };
        const getCdnConfig = vi.fn().mockResolvedValue(config);

        await expect(getPollingConfig(getCdnConfig)).resolves.toEqual(config);
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'pollingConfig',
            fallback: DEFAULT_POLLING_CONFIG,
        });
    });

    test('uses the bundled config when CDN config is unavailable', async () => {
        const getCdnConfig = vi.fn().mockResolvedValue(undefined);
        await expect(getPollingConfig(getCdnConfig)).resolves.toEqual(DEFAULT_POLLING_CONFIG);
        await expect(getPollingConfig()).resolves.toEqual(DEFAULT_POLLING_CONFIG);
    });
});
