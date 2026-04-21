/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/preact';
import * as ConfigContext from '../../../../../../core/ConfigContext';
import * as CoreContext from '../../../../../../core/Context/useCoreContext';
import { useMissingActionsPolling } from './useMissingActionsPolling';
import { IGrant, IMissingAction } from '../../../../../../types';
import { PollingConfig } from '../../../../../../config/capital/usePollingConfig';

vi.mock('../../../../../../core/ConfigContext');
vi.mock('../../../../../../core/Context/useCoreContext');

describe('useMissingActionsPolling', () => {
    const mockUseConfigContext = vi.mocked(ConfigContext.useConfigContext);
    const mockUseCoreContext = vi.mocked(CoreContext.default);

    const mockGrant: Partial<IGrant> = {
        id: 'GRANT123',
        missingActions: [{ type: 'signToS' }, { type: 'AnaCredit' }],
    };

    const defaultPollingConfig: PollingConfig = {
        missingActions: {
            initialIntervalMs: 50,
            backoffMultiplier: 1.5,
            maxDurationMs: 1000,
            strategy: 'exponentialBackoff',
        },
    };

    const getMockGetGrants = () => {
        const mockGetGrants = vi.fn();
        mockUseConfigContext.mockReturnValue({
            endpoints: { getGrants: mockGetGrants },
        } as unknown as ReturnType<typeof ConfigContext.useConfigContext>);
        return mockGetGrants;
    };

    const mockCoreContext = (pollingConfig: PollingConfig = defaultPollingConfig) => {
        mockUseCoreContext.mockReturnValue({
            getCdnConfig: vi.fn().mockResolvedValue(pollingConfig),
        } as unknown as ReturnType<typeof CoreContext.default>);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCoreContext();
    });

    test('should not poll when initialMissingActions length > 1', () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }, { type: 'AnaCredit' }];

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        expect(result.current.isPollingComplete).toBe(true);
        expect(result.current.missingActions).toEqual(initialMissingActions);
        expect(mockGetGrants).not.toHaveBeenCalled();
    });

    test('should poll when initialMissingActions length <= 1', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        expect(result.current.isPollingComplete).toBe(false);

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalled(), { timeout: 500 });
    });

    test('should stop polling when multiple missing actions are found', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        mockGetGrants.mockResolvedValue({
            data: [mockGrant as IGrant],
        });

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        await waitFor(() => expect(result.current.isPollingComplete).toBe(true), { timeout: 1000 });
        expect(result.current.missingActions).toEqual(mockGrant.missingActions);
    });

    test('should continue polling until maxDurationMs when single action persists', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        expect(result.current.isPollingComplete).toBe(false);

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalled(), { timeout: 500 });

        expect(result.current.isPollingComplete).toBe(false);
    });

    test('should stop polling after maxDurationMs is exceeded', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        mockGetGrants.mockResolvedValue({
            data: [
                {
                    id: 'GRANT123',
                    missingActions: [{ type: 'signToS' }],
                } as Partial<IGrant> as IGrant,
            ],
        });

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        await waitFor(() => expect(result.current.isPollingComplete).toBe(true), { timeout: 1500 });
    });

    test('should use exponential backoff intervals when strategy is exponentialBackoff', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        const timestamps: number[] = [];
        mockGetGrants.mockImplementation(async () => {
            timestamps.push(Date.now());
            return {
                data: [
                    {
                        id: 'GRANT123',
                        missingActions: [{ type: 'signToS' }],
                    } as Partial<IGrant> as IGrant,
                ],
            };
        });

        renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalledTimes(3), { timeout: 1000 });

        const intervals = timestamps.slice(1).map((ts, i) => ts - timestamps[i]!);
        expect(intervals[0]).toBeGreaterThanOrEqual(50);
        expect(intervals[1]).toBeGreaterThan(intervals[0]!);
    });

    test('should use fixed intervals when strategy is not exponentialBackoff', async () => {
        const fixedConfig: PollingConfig = {
            missingActions: {
                initialIntervalMs: 100,
                backoffMultiplier: 1.5,
                maxDurationMs: 500,
                strategy: 'fixed',
            },
        };
        mockCoreContext(fixedConfig);

        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        const timestamps: number[] = [];
        mockGetGrants.mockImplementation(async () => {
            timestamps.push(Date.now());
            return {
                data: [
                    {
                        id: 'GRANT123',
                        missingActions: [{ type: 'signToS' }],
                    } as Partial<IGrant> as IGrant,
                ],
            };
        });

        renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalledTimes(3), { timeout: 1000 });

        const intervals = timestamps.slice(1).map((ts, i) => ts - timestamps[i]!);
        intervals.forEach(interval => {
            expect(interval).toBeGreaterThanOrEqual(95);
            expect(interval).toBeLessThan(150);
        });
    });

    test('forcePollingComplete should stop polling immediately', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        mockGetGrants.mockResolvedValue({
            data: [
                {
                    id: 'GRANT123',
                    missingActions: [{ type: 'signToS' }],
                } as Partial<IGrant> as IGrant,
            ],
        });

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        expect(result.current.isPollingComplete).toBe(false);

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalledTimes(1), { timeout: 500 });

        const callCountBeforeForce = mockGetGrants.mock.calls.length;

        act(() => {
            result.current.forcePollingComplete();
        });

        expect(result.current.isPollingComplete).toBe(true);

        await new Promise(resolve => setTimeout(resolve, 200));

        expect(mockGetGrants).toHaveBeenCalledTimes(callCountBeforeForce);
    });

    test('should handle grant not found in response', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        mockGetGrants.mockResolvedValue({
            data: [
                {
                    id: 'DIFFERENT_GRANT',
                    missingActions: [{ type: 'AnaCredit' }],
                } as Partial<IGrant> as IGrant,
            ],
        });

        const { result } = renderHook(() =>
            useMissingActionsPolling({
                grantId: 'GRANT123',
                initialMissingActions,
            })
        );

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalled(), { timeout: 500 });

        expect(result.current.missingActions).toEqual(initialMissingActions);
    });

    test('should reset polling state when grantId changes', async () => {
        const mockGetGrants = getMockGetGrants();
        const initialMissingActions: IMissingAction[] = [{ type: 'signToS' }];

        mockGetGrants.mockResolvedValue({
            data: [
                {
                    id: 'GRANT123',
                    missingActions: [{ type: 'signToS' }],
                } as Partial<IGrant> as IGrant,
            ],
        });

        const { result, rerender } = renderHook(
            ({ grantId, initialMissingActions }) =>
                useMissingActionsPolling({
                    grantId,
                    initialMissingActions,
                }),
            {
                initialProps: {
                    grantId: 'GRANT123',
                    initialMissingActions,
                },
            }
        );

        await waitFor(() => expect(mockGetGrants).toHaveBeenCalled(), { timeout: 500 });

        act(() => {
            result.current.forcePollingComplete();
        });

        expect(result.current.isPollingComplete).toBe(true);

        const newMissingActions: IMissingAction[] = [{ type: 'AnaCredit' }];
        mockGetGrants.mockResolvedValue({
            data: [
                {
                    id: 'GRANT456',
                    missingActions: [{ type: 'AnaCredit' }, { type: 'signToS' }],
                } as Partial<IGrant> as IGrant,
            ],
        });

        rerender({
            grantId: 'GRANT456',
            initialMissingActions: newMissingActions,
        });

        expect(result.current.isPollingComplete).toBe(false);
        expect(result.current.missingActions).toEqual(newMissingActions);

        await waitFor(() => expect(result.current.isPollingComplete).toBe(true), { timeout: 1000 });
        expect(result.current.missingActions).toEqual([{ type: 'AnaCredit' }, { type: 'signToS' }]);
    });
});
