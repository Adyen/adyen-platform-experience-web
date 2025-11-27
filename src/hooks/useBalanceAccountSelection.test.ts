/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/preact';
import useCoreContext from '../core/Context/useCoreContext';
import useFilterAnalyticsEvent from './useAnalytics/useFilterAnalyticsEvent';
import useBalanceAccountSelection, { ALL_BALANCE_ACCOUNTS_SELECTION_ID } from './useBalanceAccountSelection';
import type { IBalanceAccountBase } from '../types';

vi.mock('../core/Context/useCoreContext');
vi.mock('./useAnalytics/useFilterAnalyticsEvent');

describe('useBalanceAccountSelection', () => {
    const mockLogEvent = vi.fn();
    const mockUseCoreContext = vi.mocked(useCoreContext);
    const mockUseFilterAnalyticsEvent = vi.mocked(useFilterAnalyticsEvent);

    const mockBalanceAccounts = [
        { id: 'BA00000000000000000000001', description: 'balanceAccount 1' } as IBalanceAccountBase,
        { id: 'BA00000000000000000000002', description: 'balanceAccount 2' } as IBalanceAccountBase,
        { id: 'BA00000000000000000000003', description: 'balanceAccount 3' } as IBalanceAccountBase,
    ];

    beforeEach(() => {
        mockUseCoreContext.mockReturnValue({
            i18n: { get: (key: string) => (key === 'common.filters.types.account.options.all' ? 'All balance accounts' : key) },
        } as ReturnType<typeof useCoreContext>);
        mockUseFilterAnalyticsEvent.mockReturnValue({ logEvent: mockLogEvent });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('should return correct initial state with no balance accounts', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({}));

        expect(result.current).toEqual({
            activeBalanceAccount: undefined,
            balanceAccountSelectionOptions: [],
            onBalanceAccountSelection: expect.any(Function),
            resetBalanceAccountSelection: expect.any(Function),
        });
    });

    test('should initialize with the first balance account selected by default', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts }));

        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[0]);
        expect(result.current.balanceAccountSelectionOptions).toEqual([
            { id: 'BA00000000000000000000001', name: 'BalanceAccount 1' },
            { id: 'BA00000000000000000000002', name: 'BalanceAccount 2' },
            { id: 'BA00000000000000000000003', name: 'BalanceAccount 3' },
        ]);
    });

    test('should include "All balance accounts" option if there are multiple accounts and allowAllSelection is true', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts, allowAllSelection: true }));

        expect(result.current.balanceAccountSelectionOptions).toEqual([
            { id: 'BA00000000000000000000001', name: 'BalanceAccount 1' },
            { id: 'BA00000000000000000000002', name: 'BalanceAccount 2' },
            { id: 'BA00000000000000000000003', name: 'BalanceAccount 3' },
            { id: ALL_BALANCE_ACCOUNTS_SELECTION_ID, name: 'All balance accounts' },
        ]);
    });

    test('should not include "All balance accounts" option if there is only one account', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: [mockBalanceAccounts[0]!], allowAllSelection: true }));
        expect(result.current.balanceAccountSelectionOptions).toHaveLength(1);
        expect(result.current.balanceAccountSelectionOptions).toEqual([{ id: 'BA00000000000000000000001', name: 'BalanceAccount 1' }]);
    });

    test('should update the active balance account on selection', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts }));
        act(() => result.current.onBalanceAccountSelection({ target: { value: 'BA00000000000000000000002' } }));
        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[1]);
    });

    test('should call onUpdateSelection and log event when selection changes', () => {
        const onUpdateSelection = vi.fn();

        const { result } = renderHook(() =>
            useBalanceAccountSelection({
                balanceAccounts: mockBalanceAccounts,
                eventCategory: 'TestCategory',
                onUpdateSelection,
            })
        );

        // Initial render calls onUpdateSelection
        expect(onUpdateSelection).toHaveBeenCalledOnce();
        expect(onUpdateSelection).toHaveBeenCalledWith(mockBalanceAccounts[0]);
        expect(mockLogEvent).not.toHaveBeenCalled();

        act(() => result.current.onBalanceAccountSelection({ target: { value: 'BA00000000000000000000002' } }));

        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[1]);
        expect(onUpdateSelection).toHaveBeenCalledTimes(2);
        expect(onUpdateSelection).toHaveBeenCalledWith(mockBalanceAccounts[1]);
        expect(mockLogEvent).toHaveBeenCalledTimes(1);
        expect(mockLogEvent).toHaveBeenCalledWith('update', 'BA00000000000000000000002');
    });

    test('should reset selection to the first account', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts }));

        act(() => result.current.onBalanceAccountSelection({ target: { value: 'BA00000000000000000000003' } }));
        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[2]);

        act(() => result.current.resetBalanceAccountSelection());
        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[0]);
    });

    test('should not change selection if an invalid id is passed', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts }));
        act(() => result.current.onBalanceAccountSelection({ target: { value: 'invalid-id' } }));
        expect(result.current.activeBalanceAccount).toEqual(mockBalanceAccounts[0]);
    });

    test('should select the "All" option correctly', () => {
        const { result } = renderHook(() => useBalanceAccountSelection({ balanceAccounts: mockBalanceAccounts, allowAllSelection: true }));
        act(() => result.current.onBalanceAccountSelection({ target: { value: ALL_BALANCE_ACCOUNTS_SELECTION_ID } }));

        expect(result.current.activeBalanceAccount?.id).toBe(ALL_BALANCE_ACCOUNTS_SELECTION_ID);
        expect(result.current.activeBalanceAccount?.description).toBeUndefined();
    });
});
