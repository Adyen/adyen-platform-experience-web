import { describe, expect, test } from 'vitest';
import type { IContractType } from '@integration-components/types';
import { getIsContractTypeSupported } from './contractType';

describe('getIsContractTypeSupported', () => {
    test('supports loans in any region', () => {
        expect(getIsContractTypeSupported('Loan', 'GB')).toBe(true);
        expect(getIsContractTypeSupported('Loan', 'US')).toBe(true);
        expect(getIsContractTypeSupported('Loan', undefined)).toBe(true);
    });

    test('supports cash advances only in cash advance regions', () => {
        expect(getIsContractTypeSupported('CashAdvance', 'GB')).toBe(true);
        expect(getIsContractTypeSupported('CashAdvance', 'US')).toBe(false);
        expect(getIsContractTypeSupported('CashAdvance', 'EU')).toBe(false);
        expect(getIsContractTypeSupported('CashAdvance', undefined)).toBe(false);
    });

    test('returns false for an unsupported contract type', () => {
        expect(getIsContractTypeSupported('HardwareFinancing' as IContractType, 'GB')).toBe(false);
    });
});
