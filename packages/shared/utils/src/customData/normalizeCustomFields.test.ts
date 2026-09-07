import { describe, expect, test } from 'vitest';
import { normalizeCustomFields } from './normalizeCustomFields';

describe('normalizeCustomFields', () => {
    test('should expand a configured field to each mapped display field', () => {
        const fields = [{ key: 'latestDefense', visibility: 'hidden' }] as const;
        const fieldMappings = {
            latestDefense: ['defenseReason', 'defendedOn', 'disputeEvidence'],
        } as const;

        expect(normalizeCustomFields(fields, fieldMappings)).toEqual([
            { key: 'defenseReason', visibility: 'hidden' },
            { key: 'defendedOn', visibility: 'hidden' },
            { key: 'disputeEvidence', visibility: 'hidden' },
        ]);
    });
});
