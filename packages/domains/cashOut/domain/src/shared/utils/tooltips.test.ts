import { describe, expect, test } from 'vitest';
import type { ICashOutEligibility } from '@integration-components/types';
import { formatBasisPoints, getAvailableForCashOutTooltip, getFeeTooltip } from './tooltips';

const euro = (value: number) => ({ value, currency: 'EUR' });
const feeStructureOf = (fixedAmount: number, variableBasisPoints: number): ICashOutEligibility['feeStructure'] => ({
    fixedAmount: euro(fixedAmount),
    variableBasisPoints,
});

describe('getAvailableForCashOutTooltip', () => {
    test('should mention the daily limit when the balance account has one', () => {
        expect(getAvailableForCashOutTooltip(euro(2_500_000))).toEqual({
            key: 'cashOut.common.availableForCashOut.tooltips.withDailyLimit',
            dailyLimit: euro(2_500_000),
        });
    });

    test('should mention a daily limit of 0, which is a limit, unlike a missing one', () => {
        expect(getAvailableForCashOutTooltip(euro(0))).toEqual({
            key: 'cashOut.common.availableForCashOut.tooltips.withDailyLimit',
            dailyLimit: euro(0),
        });
    });

    test('should leave the limit out when none is configured', () => {
        expect(getAvailableForCashOutTooltip(undefined)).toEqual({ key: 'cashOut.common.availableForCashOut.tooltips.default' });
        expect(getAvailableForCashOutTooltip(null)).toEqual({ key: 'cashOut.common.availableForCashOut.tooltips.default' });
    });
});

describe('getFeeTooltip', () => {
    test.each([
        [
            'a fixed amount plus a percentage',
            feeStructureOf(50, 150),
            { key: 'cashOut.request.fields.fees.tooltips.fixedAndVariable', fixedAmount: euro(50), basisPoints: 150 },
        ],
        ['only a percentage', feeStructureOf(0, 150), { key: 'cashOut.request.fields.fees.tooltips.variable', basisPoints: 150 }],
        ['only a fixed amount', feeStructureOf(50, 0), { key: 'cashOut.request.fields.fees.tooltips.fixed', fixedAmount: euro(50) }],
        ['no fee', feeStructureOf(0, 0), { key: 'cashOut.request.fields.fees.tooltips.free' }],
    ])('should explain a fee of %s', (_, feeStructure, expected) => {
        expect(getFeeTooltip(feeStructure)).toEqual(expected);
    });
});

describe('formatBasisPoints', () => {
    test.each([
        [150, 'en-US', '1.5%'],
        [100, 'en-US', '1%'],
        [125, 'en-US', '1.25%'],
        [1, 'en-US', '0.01%'],
        [150, 'nl-NL', '1,5%'],
    ])('should format %s basis points as a percentage in %s', (basisPoints, locale, expected) => {
        expect(formatBasisPoints(basisPoints, locale)).toBe(expected);
    });
});
