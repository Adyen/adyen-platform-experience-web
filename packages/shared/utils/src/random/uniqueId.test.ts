import { describe, expect, test } from 'vitest';
import { uniqueId } from './uniqueId';

describe('uniqueId', () => {
    const [, defaultPrefix, startId] = uniqueId().match(/^(\D+?)-?(\d+)$/)!;
    let lastId = Number(startId!);

    test('should always generate a unique id', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 50; i++) {
            const id = uniqueId();

            // ID should be unique
            expect(id).toBe(`${defaultPrefix}-${++lastId}`);
            expect(ids.has(id)).toBe(false);

            // Add ID to the set
            ids.add(id);
        }
    });

    test('should generate a unique id with the specified prefix', () => {
        ['field', '-prefix', 'prefix-1', 'prefix_2', '12345'].forEach(prefix => expect(uniqueId(prefix)).toBe(`${prefix}-${++lastId}`));
    });
});
