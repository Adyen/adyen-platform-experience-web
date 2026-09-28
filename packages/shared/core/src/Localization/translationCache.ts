/**
 * In-memory cache for the translation catalogs fetched from the CDN.
 *
 * Entries are keyed by the catalog URL, which encodes both the file and the locale, so every
 * `Localization` (SDK and Bento, and every `Core` instance) reading the same catalog shares one
 * entry. The cache invalidates itself: concurrent requests for a catalog share a single in-flight
 * fetch, a settled response is reused only while it is younger than the predefined time-to-live,
 * and expired entries are dropped whenever a new catalog is cached. Rejected requests are never
 * cached, so the next request retries the CDN.
 */

export const DEFAULT_TRANSLATIONS_CACHE_TTL = 5 * 60 * 1000;

type TranslationCacheEntry = {
    translationsPromise: Promise<any>;
    fetchedAt: number;
    isSettled: boolean;
};

const entries = new Map<string, TranslationCacheEntry>();

/**
 * Drops every settled entry that is older than the time-to-live. Entries with a pending fetch are
 * kept, so concurrent consumers always share the in-flight request.
 */
const pruneExpiredEntries = (now: number): void => {
    for (const [url, entry] of entries) {
        if (entry.isSettled && DEFAULT_TRANSLATIONS_CACHE_TTL <= now - entry.fetchedAt) {
            entries.delete(url);
        }
    }
};

/**
 * Returns the translations cached for the catalog at the given URL, fetching and caching them
 * when there is no entry that can be reused.
 *
 * @param url - CDN location of the translation catalog, used as the cache key (file and locale)
 * @param fetchTranslations - Fetches the catalog from the CDN when no reusable entry is available
 * @returns The cached or freshly fetched translations
 */
export function getCachedTranslations(url: string, fetchTranslations: () => Promise<any>): Promise<any> {
    const cached = entries.get(url);
    const fetchedAt = Date.now();

    // An in-flight fetch is always shared, so concurrent requests coalesce into a single request.
    // A settled fetch is reused only while it is younger than the time-to-live.
    if (cached && (!cached.isSettled || DEFAULT_TRANSLATIONS_CACHE_TTL > fetchedAt - cached.fetchedAt)) {
        return cached.translationsPromise;
    }

    // Internal invalidation: expired entries never survive a new catalog being cached.
    pruneExpiredEntries(fetchedAt);

    const entry: TranslationCacheEntry = {
        translationsPromise: fetchTranslations(),
        fetchedAt,
        isSettled: false,
    };

    entry.translationsPromise.then(
        () => {
            entry.isSettled = true;
        },
        () => {
            // Rejected requests are not cached: drop the entry so the next request retries the CDN.
            if (entries.get(url) === entry) {
                entries.delete(url);
            }
        }
    );

    entries.set(url, entry);
    return entry.translationsPromise;
}

/**
 * Drops every cached translation catalog, so the next request for any file or locale fetches it
 * from the CDN again.
 */
export function invalidateTranslationsCache(): void {
    entries.clear();
}
