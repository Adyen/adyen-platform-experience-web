import { describe, expect, test } from 'vitest';
import { uuid, UUID_V4_REGEXP } from './uuid';

describe('uuid', () => {
    const _randomUUID = (length: number) => {
        const random = new Set<string>();

        for (let i = 0; i < length; i++) {
            const randomUUID = uuid();
            random.has(randomUUID) ? --i : random.add(randomUUID);
        }

        return random;
    };

    test('should generate a valid version 4 UUID', () => {
        // random uuids (version 4)
        _randomUUID(50).forEach(id => expect(UUID_V4_REGEXP.test(id)).toBe(true));
    });

    test('should generate a unique version 4 UUID (very little chance of collision)', () => {
        const ids = new Set<string>();

        for (let i = 0; i < 50; i++) {
            const id = uuid();

            // UUID should be unique
            expect(UUID_V4_REGEXP.test(id)).toBe(true);
            expect(ids.has(id)).toBe(false);

            // Add UUID to the set
            ids.add(id);
        }
    });
});
