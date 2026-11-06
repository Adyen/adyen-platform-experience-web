/**
 * @vitest-environment node
 */
import { describe, expect, test } from 'vitest';
import { recentDateRange, structureMismatches } from './contract-structure';

const AMOUNT = { value: 0, currency: '' };

describe('structureMismatches', () => {
    test('ignores values and extra fields', () => {
        expect(structureMismatches({ amount: { value: 791, currency: 'EUR' }, extra: true }, { amount: AMOUNT })).toEqual([]);
    });

    test('reports missing fields and wrong types with their path', () => {
        expect(structureMismatches({ amount: { value: '791' } }, { amount: AMOUNT })).toEqual([
            '$.amount.value: expected number, received string',
            '$.amount.currency: missing',
        ]);
    });

    test('checks every array item against the first template item', () => {
        expect(structureMismatches({ events: [AMOUNT, { value: 1 }] }, { events: [AMOUNT] })).toEqual(['$.events[1].currency: missing']);
        expect(structureMismatches({ events: 'none' }, { events: [] })).toEqual(['$.events: expected array, received string']);
    });

    test('distinguishes null from objects', () => {
        expect(structureMismatches({ amount: null }, { amount: AMOUNT })).toEqual(['$.amount: expected object, received null']);
    });
});

test('recentDateRange covers the given number of days up to now', () => {
    const now = Date.parse('2026-09-29T12:00:00.000Z');
    expect(recentDateRange(180, now)).toEqual({ createdSince: '2026-04-02T12:00:00.000Z', createdUntil: '2026-09-29T12:00:00.000Z' });
});
