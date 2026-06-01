import { describe, expect, test } from 'vitest';
import { uuid, UUID_V4_REGEXP } from './uuid';

describe('uuid', () => {
    test('should generate a valid version 4 UUID', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 50; i++) {
            // random UUID (version 4)
            const id = uuid();

            if (!ids.has(id)) {
                expect(UUID_V4_REGEXP.test(id)).toBe(true);
                ids.add(id);
            } else --i;
        }
    });

    test('should generate a unique version 4 UUID (very little chance of collision)', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 50; i++) {
            // random UUID (version 4)
            const id = uuid();

            // UUID should be unique
            expect(UUID_V4_REGEXP.test(id)).toBe(true);
            expect(ids.has(id)).toBe(false);

            // Add UUID to the set
            ids.add(id);
        }
    });
});
