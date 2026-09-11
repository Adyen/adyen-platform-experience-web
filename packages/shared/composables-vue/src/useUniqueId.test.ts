import { describe, expect, test } from 'vitest';
import { useUniqueId } from './useUniqueId';

describe('useUniqueId', () => {
    test('returns distinct numeric IDs', () => {
        const ids = [useUniqueId(), useUniqueId(), useUniqueId()];

        expect(new Set(ids).size).toBe(3);
        ids.forEach(id => expect(id).toMatch(/^\d+$/));
    });
});
