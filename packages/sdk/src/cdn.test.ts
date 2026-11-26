/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('./index', () => ({
    AdyenPlatformExperience: class AdyenPlatformExperience {},
    TransactionsOverview: class TransactionsOverview {},
}));

const loadCdnEntry = () => import('./cdn');

describe('CDN entry', () => {
    beforeEach(() => vi.resetModules());
    afterEach(() => vi.unstubAllGlobals());

    test('exposes the public API as window.AdyenPlatformExperienceWeb', async () => {
        const fakeWindow: Record<string, unknown> = {};
        vi.stubGlobal('window', fakeWindow);

        const cdnEntry = await loadCdnEntry();
        const exposed = fakeWindow.AdyenPlatformExperienceWeb as Record<string, unknown>;

        expect(exposed.AdyenPlatformExperience).toBe(cdnEntry.AdyenPlatformExperience);
        expect(exposed.TransactionsOverview).toBe(cdnEntry.TransactionsOverview);
        expect(Object.keys(exposed).sort()).toEqual(['AdyenPlatformExperience', 'TransactionsOverview']);
        expect(Object.getOwnPropertyDescriptor(fakeWindow, 'AdyenPlatformExperienceWeb')).toMatchObject({
            enumerable: true,
            writable: false,
            configurable: false,
        });
    });

    test('keeps a global defined by an SDK loaded earlier', async () => {
        const existing = { AdyenPlatformExperience: class {} };
        const fakeWindow: Record<string, unknown> = { AdyenPlatformExperienceWeb: existing };
        vi.stubGlobal('window', fakeWindow);

        await loadCdnEntry();

        expect(fakeWindow.AdyenPlatformExperienceWeb).toBe(existing);
    });

    test('does not require a window', async () => {
        vi.stubGlobal('window', undefined);

        await expect(loadCdnEntry()).resolves.toHaveProperty('AdyenPlatformExperience');
    });
});
