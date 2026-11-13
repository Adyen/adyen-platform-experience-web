import { describe, expect, test } from 'vitest';
import { decodeAnalyticsEvent as decodeEvent } from '@integration-components/testing';
import { getCustomTranslationsAnalyticsPayload } from './customTranslations';

const decodeEvents = async (customTranslations: Parameters<typeof getCustomTranslationsAnalyticsPayload>[0]) =>
    (await getCustomTranslationsAnalyticsPayload(customTranslations)).map(payload => decodeEvent(payload));

describe('getCustomTranslationsAnalyticsPayload', () => {
    test('returns no payloads without custom translations', async () => {
        await expect(getCustomTranslationsAnalyticsPayload({})).resolves.toEqual([]);
    });

    test('reports a locale the SDK does not support as a new language', async () => {
        const [event, ...rest] = await decodeEvents({ 'ca-ES': { 'payouts.common.copy.label': 'Copia' } });

        expect(rest).toEqual([]);
        expect(event?.event).toBe('Added new language');
        expect(event?.properties).toMatchObject({ category: 'PIE', subCategory: 'Core', locale: 'ca-ES' });
    });

    test('splits the customized keys of a supported locale into known and unknown keys', async () => {
        const germanTranslations: Record<string, string> = { 'payouts.common.copy.label': 'Kopieren', 'payouts.unknown.key': 'Unbekannt' };
        const [event, ...rest] = await decodeEvents({ 'de-DE': germanTranslations });

        expect(rest).toEqual([]);
        expect(event?.event).toBe('Customized translation');
        expect(event?.properties).toMatchObject({
            locale: 'de-DE',
            keys: ['payouts.common.copy.label'],
            unmatchedKeys: ['payouts.unknown.key'],
        });
    });

    test('omits the key lists that are empty', async () => {
        const [event] = await decodeEvents({ 'de-DE': { 'payouts.common.copy.label': 'Kopieren' } });

        expect(event?.properties).toHaveProperty('keys', ['payouts.common.copy.label']);
        expect(event?.properties).not.toHaveProperty('unmatchedKeys');
    });

    test('skips supported locales without customized keys and keeps the locale order', async () => {
        const events = await decodeEvents({
            'ca-ES': { 'payouts.common.copy.label': 'Copia' },
            'de-DE': {},
            'fr-FR': { 'payouts.common.copy.label': 'Copier' },
        });

        expect(events.map(({ event, properties }) => [event, properties.locale])).toEqual([
            ['Added new language', 'ca-ES'],
            ['Customized translation', 'fr-FR'],
        ]);
    });
});
