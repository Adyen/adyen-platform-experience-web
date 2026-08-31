import { describe, expect, test } from 'vitest';
import { PAY_BY_LINK_EN_US, PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS, PAY_BY_LINK_TRANSLATION_LOADERS } from './index';

describe('PayByLink translations', () => {
    test('provides enumerable JSON copy for every supported locale', async () => {
        expect(Object.keys(PAY_BY_LINK_EN_US)).toContain('payByLink.overview.title');
        expect(Object.keys(PAY_BY_LINK_EN_US)).toContain('payByLink.errors.fieldRequired');
        const expectedKeys = new Set(Object.keys(PAY_BY_LINK_EN_US));
        for (const load of Object.values(PAY_BY_LINK_TRANSLATION_LOADERS)) {
            const source = await load();
            expect(Object.keys(source).every(key => expectedKeys.has(key))).toBe(true);
        }
        expect(PAY_BY_LINK_PROTECTED_TRANSLATION_KEYS).toBeInstanceOf(Set);
    });

    test('uses English as its complete source locale', () => {
        expect(PAY_BY_LINK_EN_US['payByLink.overview.title']).toBe('Payment links');
    });

    test('loads copy for an exact locale', async () => {
        const nlNL = await PAY_BY_LINK_TRANSLATION_LOADERS['nl-NL']();
        expect(nlNL['payByLink.overview.title']).toBe('Betalingslinks');
    });
});
