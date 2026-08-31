import { describe, expect, test } from 'vitest';
import { getReportType } from '../ReportsOverview/translations';
import { REPORTS_EN_US, REPORTS_PROTECTED_TRANSLATION_KEYS, REPORTS_TRANSLATION_LOADERS, type ReportsTranslationKey } from './index';

describe('Reports translations', () => {
    test('provides enumerable JSON copy for every supported locale', async () => {
        expect(Object.keys(REPORTS_EN_US)).toContain('reports.overview.title');
        expect(Object.keys(REPORTS_EN_US)).toContain('reports.errors.updateFilters');
        const expectedKeys = new Set(Object.keys(REPORTS_EN_US));
        for (const load of Object.values(REPORTS_TRANSLATION_LOADERS)) {
            const source = await load();
            expect(Object.keys(source).every(key => expectedKeys.has(key))).toBe(true);
        }
        expect(REPORTS_PROTECTED_TRANSLATION_KEYS).toBeInstanceOf(Set);
    });

    test('uses English as its complete source locale', () => {
        expect(REPORTS_EN_US['reports.overview.title']).toBe('Reports');
    });

    test('loads copy for an exact locale', async () => {
        const fiFI = await REPORTS_TRANSLATION_LOADERS['fi-FI']();
        expect(fiFI['reports.overview.title']).toBe('Raportit');
    });

    test('enumerates known report types and returns unknown backend types as text', () => {
        const i18n = { get: (key: Extract<ReportsTranslationKey, `reports.common.types.${string}`>) => REPORTS_EN_US[key] };
        expect(getReportType(i18n, 'payout')).toBe('Payout');
        expect(getReportType(i18n, 'futureReportType')).toBe('futureReportType');
    });
});
