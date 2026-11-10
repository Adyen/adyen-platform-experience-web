import { describe, expect, test } from 'vitest';
import type { IContractType } from '@integration-components/types';
import { isSupportedContractType } from './contractType';

describe('isSupportedContractType', () => {
    test('returns true for supported contract types', () => {
        expect(isSupportedContractType('CashAdvance')).toBe(true);
        expect(isSupportedContractType('Loan')).toBe(true);
    });

    test('returns false for an unsupported contract type', () => {
        expect(isSupportedContractType('HardwareFinancing' as IContractType)).toBe(false);
    });
});
