/**
 * Canonicalizes a locale at a domain translation boundary.
 *
 * Underscores remain accepted for compatibility with existing portal input.
 * Related locales are never inferred.
 */
export const canonicalizeTranslationLocale = (locale: string | undefined | null): string | undefined => {
    if (locale == null) return undefined;

    const candidate = locale.trim().replaceAll('_', '-');
    if (!candidate) return undefined;

    try {
        return Intl.getCanonicalLocales(candidate)[0];
    } catch {
        return undefined;
    }
};

export const translationLocalesMatch = (left: string, right: string): boolean => {
    const canonicalLeft = canonicalizeTranslationLocale(left);
    const canonicalRight = canonicalizeTranslationLocale(right);
    return canonicalLeft !== undefined && canonicalLeft === canonicalRight;
};
