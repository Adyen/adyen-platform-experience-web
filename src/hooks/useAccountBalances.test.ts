/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import useAccountBalances from './useAccountBalances';
import * as ConfigContext from '../core/ConfigContext';
import { IBalanceAccountBase } from '../types';

vi.mock('../core/ConfigContext');

describe('useAccountBalances', () => {
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);

    const getMockBalancesEndpoint = () => {
        const mockBalancesEndpoint = vi.fn();

        mockUseConfigContext.mockReturnValue({
            endpoints: { getBalances: mockBalancesEndpoint },
        } as unknown as ReturnType<(typeof ConfigContext)['useConfigContext']>);

        return mockBalancesEndpoint;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return correct initial state when balances endpoint is not available', () => {
        const expectedResult = {
            balances: [],
            balancesLookup: {},
            currencies: [],
            error: undefined,
            isAvailable: false,
            isEmpty: true,
            isWaiting: false,
        };

        mockUseConfigContext.mockReturnValue({
            endpoints: { getBalances: undefined },
        } as unknown as ReturnType<(typeof ConfigContext)['useConfigContext']>);

        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));
        expect(result.current).toStrictEqual(expectedResult);

        [undefined, null, '', 'ID'].forEach(id => {
            rerender({ id } as IBalanceAccountBase);
            expect(result.current).toStrictEqual(expectedResult);
        });
    });

    test('should return correct initial state when balances endpoint is available', async () => {
        const expectedResult = {
            balances: [],
            balancesLookup: {},
            currencies: [],
            error: undefined,
            isAvailable: true,
            isEmpty: true,
            isWaiting: true,
        };

        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        expect(result.current).toStrictEqual(expectedResult);
        expect(mockBalancesEndpoint).not.toHaveBeenCalled();

        [undefined, null, ''].forEach(id => {
            rerender({ id } as IBalanceAccountBase);
            expect(result.current).toStrictEqual(expectedResult);
            expect(mockBalancesEndpoint).not.toHaveBeenCalled();
        });

        rerender({ id: 'ID' } as IBalanceAccountBase);

        expect(result.current).toStrictEqual(expectedResult);
        expect(mockBalancesEndpoint).toHaveBeenCalledOnce();
        expect(mockBalancesEndpoint.mock.lastCall?.[1]?.path).toStrictEqual({ balanceAccountId: 'ID' });

        await waitFor(() => expect(result.current).toStrictEqual({ ...expectedResult, isWaiting: false }));
    });

    test('should return same state for same balance account ID', async () => {
        const expectedResult = {
            balances: [],
            balancesLookup: {},
            currencies: [],
            error: undefined,
            isAvailable: true,
            isEmpty: true,
            isWaiting: false,
        };

        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        for (let i = 0; i < 3; i++) {
            rerender({ id: 'ID' } as IBalanceAccountBase);
            expect(mockBalancesEndpoint).toHaveBeenCalledOnce();
            expect(mockBalancesEndpoint.mock.lastCall?.[1]?.path).toStrictEqual({ balanceAccountId: 'ID' });
            await waitFor(() => expect(result.current).toStrictEqual(expectedResult));
        }
    });

    test('should abort previous signal before initiating latest fetch request', async () => {
        const abortSignals: AbortSignal[] = [];
        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        ['ID_1', 'ID_2', 'ID_1'].forEach((id, index) => {
            rerender({ id } as IBalanceAccountBase);

            const currentSignal = mockBalancesEndpoint.mock.lastCall?.[0]?.signal;

            expect(currentSignal?.aborted).toBe(false);
            expect(mockBalancesEndpoint).toHaveBeenCalledTimes(index + 1);
            expect(mockBalancesEndpoint.mock.lastCall?.[1]?.path).toStrictEqual({ balanceAccountId: id });

            if (index > 0) {
                const previousSignal = abortSignals[index - 1];
                expect(previousSignal).not.toBe(currentSignal);
                expect(previousSignal?.aborted).toBe(true);
            }

            abortSignals.push(currentSignal);
        });

        await waitFor(() =>
            expect(result.current).toStrictEqual({
                balances: [],
                balancesLookup: {},
                currencies: [],
                error: undefined,
                isAvailable: true,
                isEmpty: true,
                isWaiting: false,
            })
        );

        expect(abortSignals.at(-1)?.aborted).toBe(false);
    });

    test('should return correct state for unexpected balances response', async () => {
        const expectedResult = {
            balances: [],
            balancesLookup: {},
            currencies: [],
            error: undefined,
            isAvailable: true,
            isEmpty: true,
            isWaiting: false,
        };

        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        // prettier-ignore
        mockBalancesEndpoint
            .mockResolvedValueOnce('string')
            .mockResolvedValueOnce({ unknown: 'o_O' })
            .mockResolvedValueOnce({ data: { object: 'instead_of_array' } });

        for (const id of ['ID_1', 'ID_2', 'ID_1']) {
            rerender({ id } as IBalanceAccountBase);
            await waitFor(() => expect(result.current).toStrictEqual(expectedResult));
        }
    });

    test('should return correct state with balances response of latest fetch request', async () => {
        const balances = [
            { currency: 'USD', reservedValue: 30, value: 150 },
            { currency: 'CAD', reservedValue: 20, value: 120 },
            { currency: 'AUD', reservedValue: 15, value: 100 },
            { currency: 'EUR', reservedValue: 10, value: 100 },
            { currency: 'CAD', reservedValue: 15, value: 100 },
        ];

        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        // prettier-ignore
        mockBalancesEndpoint
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: undefined })
            .mockResolvedValueOnce({ data: balances });

        ['ID_1', 'ID_2', 'ID_1'].forEach(id => rerender({ id } as IBalanceAccountBase));

        await waitFor(() =>
            expect(result.current).toStrictEqual({
                balances: balances,
                balancesLookup: {
                    AUD: { currency: 'AUD', reservedValue: 15, value: 100 },
                    CAD: { currency: 'CAD', reservedValue: 15, value: 100 },
                    EUR: { currency: 'EUR', reservedValue: 10, value: 100 },
                    USD: { currency: 'USD', reservedValue: 30, value: 150 },
                },
                currencies: ['AUD', 'CAD', 'EUR', 'USD'],
                error: undefined,
                isAvailable: true,
                isEmpty: false,
                isWaiting: false,
            })
        );
    });

    test('should return correct state with error response of latest fetch request', async () => {
        const mockBalancesEndpoint = getMockBalancesEndpoint();
        const { result, rerender } = renderHook((balanceAccount?: IBalanceAccountBase) => useAccountBalances(balanceAccount));

        // prettier-ignore
        mockBalancesEndpoint
            .mockRejectedValueOnce('o_O')
            .mockRejectedValueOnce('oops!!!')
            .mockRejectedValueOnce('unknown_error');

        ['ID_1', 'ID_2', 'ID_1'].forEach(id => rerender({ id } as IBalanceAccountBase));

        await waitFor(() =>
            expect(result.current).toStrictEqual({
                balances: [],
                balancesLookup: {},
                currencies: [],
                error: 'unknown_error',
                isAvailable: true,
                isEmpty: true,
                isWaiting: false,
            })
        );
    });
});
