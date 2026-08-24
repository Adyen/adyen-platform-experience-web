import { describe, expect, test } from 'vitest';
import { calculatePercentageFromBasisPoints } from './generic';

describe('calculatePercentageFromBasisPoints', () => {
    test('converts basis points to a percentage', () => {
        expect(calculatePercentageFromBasisPoints(1250)).toBe(12.5);
    });
});
