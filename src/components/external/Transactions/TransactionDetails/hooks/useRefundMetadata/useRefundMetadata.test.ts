/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useRefundMetadata } from './useRefundMetadata';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import { RefundMode, RefundedState, TransactionDetails } from '../../types';
import { IRefundStatus } from '../../../../../../types';

vi.mock('../../../../../core/ConfigContext');

describe('useRefundMetadata', () => {
    const mockUseConfigContext = vi.mocked(useConfigContext);
    const mockInitiateRefund = vi.fn();

    const createTransaction = (refundDetails: Partial<TransactionDetails['refundDetails']> = {}, netAmountCurrency = 'EUR'): TransactionDetails => {
        return {
            netAmount: { currency: netAmountCurrency, value: 1000 },
            refundDetails: {
                refundMode: RefundMode.FULL_AMOUNT,
                refundLocked: false,
                refundableAmount: { currency: 'EUR', value: 1000 },
                refundStatuses: [],
                ...refundDetails,
            },
        } as unknown as TransactionDetails;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseConfigContext.mockReturnValue({
            endpoints: { initiateRefund: mockInitiateRefund },
        } as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initial State & Defaults', () => {
        test('should return correct defaults for undefined transaction', () => {
            const { result } = renderHook(() => useRefundMetadata(undefined));

            expect(result.current).toEqual({
                fullRefundFailed: false,
                fullRefundInProgress: false,
                refundableAmount: 0,
                refundable: true,
                refundAvailable: false,
                refundAuthorization: true,
                refundCurrency: '',
                refundDisabled: true,
                refundAmounts: {},
                refundedAmount: 0,
                refundedState: RefundedState.INDETERMINATE,
                refundLocked: false,
                refundMode: RefundMode.FULL_AMOUNT,
            });
        });

        test('should return correct defaults for transaction with minimal details', () => {
            const transaction = createTransaction();
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current).toEqual({
                fullRefundFailed: false,
                fullRefundInProgress: false,
                refundableAmount: 1000,
                refundable: true,
                refundAvailable: true,
                refundAuthorization: true,
                refundCurrency: 'EUR',
                refundDisabled: false,
                refundAmounts: {},
                refundedAmount: 0,
                refundedState: RefundedState.INDETERMINATE,
                refundLocked: false,
                refundMode: RefundMode.FULL_AMOUNT,
            });
        });
    });

    describe('Refund Authorization', () => {
        test('should set refundAuthorization to false if initiateRefund endpoint is missing', () => {
            mockUseConfigContext.mockReturnValue({
                endpoints: {},
            } as any);

            const transaction = createTransaction();
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundAuthorization).toBe(false);
            expect(result.current.refundAvailable).toBe(false);
            expect(result.current.refundDisabled).toBe(true);
        });

        test('should set refundAuthorization to true if initiateRefund endpoint is present', () => {
            const transaction = createTransaction();
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundAuthorization).toBe(true);
        });
    });

    describe('Refund Mode', () => {
        const REFUND_MODES = [
            { mode: RefundMode.FULL_AMOUNT, expectedRefundable: true },
            { mode: RefundMode.PARTIAL_AMOUNT, expectedRefundable: true },
            { mode: RefundMode.PARTIAL_LINE_ITEMS, expectedRefundable: true },
            { mode: RefundMode.NON_REFUNDABLE, expectedRefundable: false },
        ];

        test.each(REFUND_MODES)('should handle refund mode $mode correctly', ({ mode, expectedRefundable }) => {
            const transaction = createTransaction({ refundMode: mode });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundMode).toBe(mode);
            expect(result.current.refundable).toBe(expectedRefundable);
        });
    });

    describe('Refund Locked', () => {
        test('should disable refund when refundLocked is true', () => {
            const transaction = createTransaction({ refundLocked: true });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundLocked).toBe(true);
            expect(result.current.refundDisabled).toBe(true);
        });

        test('should enable refund when refundLocked is false', () => {
            const transaction = createTransaction({ refundLocked: false });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundLocked).toBe(false);
            expect(result.current.refundDisabled).toBe(false);
        });
    });

    describe('Refundable Amount', () => {
        test('should use refundableAmount from details', () => {
            const transaction = createTransaction({ refundableAmount: { currency: 'USD', value: 500 } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundableAmount).toBe(500);
            expect(result.current.refundCurrency).toBe('USD');
        });

        test('should default refundableAmount to 0 if missing', () => {
            const transaction = createTransaction({ refundableAmount: undefined });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundableAmount).toBe(0);
        });

        test('should use netAmount currency if refundableAmount currency is missing', () => {
            const transaction = createTransaction({ refundableAmount: undefined }, 'GBP');
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundCurrency).toBe('GBP');
        });

        test('should not allow negative refundableAmount', () => {
            const transaction = createTransaction({ refundableAmount: { currency: 'EUR', value: -100 } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundableAmount).toBe(0);
        });
    });

    describe('Refund Amounts & Statuses', () => {
        test('should calculate refund amounts correctly', () => {
            const refundStatuses = [
                { amount: { value: 100, currency: 'EUR' }, status: 'completed' as IRefundStatus },
                { amount: { value: 200, currency: 'EUR' }, status: 'in_progress' as IRefundStatus },
                { amount: { value: 300, currency: 'EUR' }, status: 'failed' as IRefundStatus },
            ];
            const transaction = createTransaction({ refundStatuses });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundAmounts).toEqual({
                completed: [100],
                in_progress: [200],
                failed: [300],
            });
            expect(result.current.refundedAmount).toBe(100);
        });

        test('should ignore 0 amount refunds', () => {
            const refundStatuses = [{ amount: { value: 0, currency: 'EUR' }, status: 'completed' as IRefundStatus }];
            const transaction = createTransaction({ refundStatuses });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundAmounts).toEqual({});
        });

        test('should handle failed refunds logic (latestNonFailedRefundIndex)', () => {
            const refundStatuses1 = [
                { amount: { value: 100, currency: 'EUR' }, status: 'failed' as IRefundStatus },
                { amount: { value: 200, currency: 'EUR' }, status: 'completed' as IRefundStatus },
            ];
            const transaction1 = createTransaction({ refundStatuses: refundStatuses1 });
            const { result: result1 } = renderHook(() => useRefundMetadata(transaction1));
            expect(result1.current.refundAmounts).toEqual({ completed: [200] });

            const refundStatuses2 = [
                { amount: { value: 100, currency: 'EUR' }, status: 'completed' as IRefundStatus },
                { amount: { value: 200, currency: 'EUR' }, status: 'failed' as IRefundStatus },
            ];
            const transaction2 = createTransaction({ refundStatuses: refundStatuses2 });
            const { result: result2 } = renderHook(() => useRefundMetadata(transaction2));
            expect(result2.current.refundAmounts).toEqual({ completed: [100], failed: [200] });
        });
    });

    describe('Full Refund Status', () => {
        test('should detect fullRefundFailed', () => {
            const refundStatuses = [{ amount: { value: 1000, currency: 'EUR' }, status: 'failed' as IRefundStatus }];
            const transaction = createTransaction({ refundStatuses, refundableAmount: { value: 1000, currency: 'EUR' } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.fullRefundFailed).toBe(true);
            expect(result.current.fullRefundInProgress).toBe(false);
        });

        test('should detect fullRefundInProgress', () => {
            const refundStatuses = [{ amount: { value: 1000, currency: 'EUR' }, status: 'in_progress' as IRefundStatus }];
            const transaction = createTransaction({ refundStatuses, refundableAmount: { value: 1000, currency: 'EUR' } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.fullRefundInProgress).toBe(true);
            expect(result.current.fullRefundFailed).toBe(false);
        });

        test('should not set fullRefund flags if refundedAmount > 0', () => {
            const refundStatuses = [
                { amount: { value: 100, currency: 'EUR' }, status: 'completed' as IRefundStatus },
                { amount: { value: 900, currency: 'EUR' }, status: 'failed' as IRefundStatus },
            ];
            const transaction = createTransaction({ refundStatuses, refundableAmount: { value: 900, currency: 'EUR' } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedAmount).toBe(100);
            expect(result.current.fullRefundFailed).toBe(false);
            expect(result.current.fullRefundInProgress).toBe(false);
        });
    });

    describe('Refunded State', () => {
        test('should return INDETERMINATE when refundedAmount is 0', () => {
            const transaction = createTransaction({ refundableAmount: { value: 1000, currency: 'EUR' } });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedState).toBe(RefundedState.INDETERMINATE);
        });

        test('should return FULL when NON_REFUNDABLE and refundableAmount is 0', () => {
            const refundStatuses = [{ amount: { value: 1000, currency: 'EUR' }, status: 'completed' as IRefundStatus }];
            const transaction = createTransaction({
                refundMode: RefundMode.NON_REFUNDABLE,
                refundableAmount: { value: 0, currency: 'EUR' },
                refundStatuses,
            });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedState).toBe(RefundedState.FULL);
        });

        test('should return PARTIAL when PARTIAL_AMOUNT and refundableAmount > 0', () => {
            const refundStatuses = [{ amount: { value: 500, currency: 'EUR' }, status: 'completed' as IRefundStatus }];
            const transaction = createTransaction({
                refundMode: RefundMode.PARTIAL_AMOUNT,
                refundableAmount: { value: 500, currency: 'EUR' },
                refundStatuses,
            });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedState).toBe(RefundedState.PARTIAL);
        });

        test('should return PARTIAL when PARTIAL_LINE_ITEMS and refundableAmount > 0', () => {
            const refundStatuses = [{ amount: { value: 500, currency: 'EUR' }, status: 'completed' as IRefundStatus }];
            const transaction = createTransaction({
                refundMode: RefundMode.PARTIAL_LINE_ITEMS,
                refundableAmount: { value: 500, currency: 'EUR' },
                refundStatuses,
            });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedState).toBe(RefundedState.PARTIAL);
        });

        test('should return INDETERMINATE for other cases', () => {
            const refundStatuses = [{ amount: { value: 500, currency: 'EUR' }, status: 'completed' as IRefundStatus }];
            const transaction = createTransaction({
                refundMode: RefundMode.FULL_AMOUNT,
                refundableAmount: { value: 500, currency: 'EUR' },
                refundStatuses,
            });
            const { result } = renderHook(() => useRefundMetadata(transaction));

            expect(result.current.refundedState).toBe(RefundedState.INDETERMINATE);
        });
    });
});
