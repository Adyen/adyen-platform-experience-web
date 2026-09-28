import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DEFAULT_TRANSLATIONS_CACHE_TTL, getCachedTranslations, invalidateTranslationsCache } from './translationCache';

describe('translationCache', () => {
    beforeEach(() => {
        invalidateTranslationsCache();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const catalogUrl = 'https://cdn.example/platform-components/assets/translations/de-DE.json';

    test('coalesces concurrent requests for the same catalog into a single fetch', async () => {
        const fetchTranslations = vi.fn(async () => ({ key: 'value' }));

        const [first, second] = await Promise.all([
            getCachedTranslations(catalogUrl, fetchTranslations),
            getCachedTranslations(catalogUrl, fetchTranslations),
        ]);

        expect(fetchTranslations).toHaveBeenCalledTimes(1);
        expect(first).toEqual({ key: 'value' });
        expect(second).toBe(first);
    });

    test('reuses a settled response within the time-to-live without refetching', async () => {
        const fetchTranslations = vi.fn(async () => ({ key: 'value' }));

        const first = await getCachedTranslations(catalogUrl, fetchTranslations);
        const second = await getCachedTranslations(catalogUrl, fetchTranslations);

        expect(fetchTranslations).toHaveBeenCalledTimes(1);
        expect(second).toBe(first);
    });

    test('refetches the catalog once the cached response is older than the time-to-live', async () => {
        vi.useFakeTimers();
        const fetchTranslations = vi.fn(async () => ({ key: 'value' }));

        await getCachedTranslations(catalogUrl, fetchTranslations);
        vi.advanceTimersByTime(DEFAULT_TRANSLATIONS_CACHE_TTL);

        const second = await getCachedTranslations(catalogUrl, fetchTranslations);

        expect(fetchTranslations).toHaveBeenCalledTimes(2);
        expect(second).toEqual({ key: 'value' });
    });

    test('does not cache rejected requests', async () => {
        const fetchTranslations = vi.fn().mockRejectedValueOnce(new Error('CDN unavailable')).mockResolvedValue({ key: 'value' });

        await expect(getCachedTranslations(catalogUrl, fetchTranslations)).rejects.toThrow('CDN unavailable');
        await expect(getCachedTranslations(catalogUrl, fetchTranslations)).resolves.toEqual({ key: 'value' });

        expect(fetchTranslations).toHaveBeenCalledTimes(2);
    });

    test('caches per catalog URL', async () => {
        const fetchTranslations = vi.fn(async () => ({ key: 'value' }));

        await getCachedTranslations('https://cdn.example/translations/de-DE.json', fetchTranslations);
        await getCachedTranslations('https://cdn.example/translations/bento/de-DE.json', fetchTranslations);
        await getCachedTranslations('https://cdn.example/translations/fr-FR.json', fetchTranslations);

        expect(fetchTranslations).toHaveBeenCalledTimes(3);
    });

    test('invalidateTranslationsCache() drops every cached response', async () => {
        const fetchTranslations = vi.fn(async () => ({ key: 'value' }));

        await getCachedTranslations(catalogUrl, fetchTranslations);
        invalidateTranslationsCache();

        await getCachedTranslations(catalogUrl, fetchTranslations);

        expect(fetchTranslations).toHaveBeenCalledTimes(2);
    });
});
