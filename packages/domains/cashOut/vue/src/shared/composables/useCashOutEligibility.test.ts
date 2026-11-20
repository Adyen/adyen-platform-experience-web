import { effectScope, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutEligibility } from './useCashOutEligibility';

const endpoints: { getCashOutEligibility?: ReturnType<typeof vi.fn> } = {};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
}));

const CHECK_INTERVAL_MS = 5000;
const PROCESSING_LIMIT_MS = 10 * 60 * 1000;

const eligibilityOf = (value: number) =>
    ({ isCashoutAvailable: true, availableForCashOutBalance: { value, currency: 'EUR' }, unavailableReasons: [] }) as unknown as ICashOutEligibility;
// While the API processes a cashOut it locks the balance account, and its eligibility tells so.
const inProgressEligibilityOf = (value: number) =>
    ({ ...eligibilityOf(value), isCashoutAvailable: false, unavailableReasons: ['cashOutInProgress'] }) as unknown as ICashOutEligibility;

const renderEligibility = (accountKey = ref<string | undefined>('BalanceAccount.BA1')) => {
    const scope = effectScope();
    const eligibility = scope.run(() => useCashOutEligibility(accountKey))!;
    return { accountKey, eligibility, stop: () => scope.stop() };
};

const requestedAccountKeys = () => endpoints.getCashOutEligibility!.mock.calls.map(([, params]) => params.path.accountKey);

describe('useCashOutEligibility', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        endpoints.getCashOutEligibility = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Once processed, the API shows the cashOut and lets cash out again, so the eligibility is checked again meanwhile.
    describe('While a cashOut is in progress', () => {
        test('should check again until it is done, showing what it shows then', async () => {
            endpoints
                .getCashOutEligibility!.mockResolvedValueOnce(inProgressEligibilityOf(0))
                .mockResolvedValueOnce(inProgressEligibilityOf(0))
                .mockResolvedValue(eligibilityOf(150));
            const { eligibility, stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(0);
            expect(eligibility.eligibility.value?.unavailableReasons).toEqual(['cashOutInProgress']);

            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);
            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(2);
            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);

            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(3);
            expect(eligibility.eligibility.value).toEqual(eligibilityOf(150));
            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 3);
            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(3);

            stop();
        });

        // Checking in the background, so the component doesn't show its skeleton every time.
        test('should keep showing the eligibility while checking, without loading', async () => {
            let resolveCheck!: (eligibility: ICashOutEligibility) => void;
            endpoints
                .getCashOutEligibility!.mockResolvedValueOnce(inProgressEligibilityOf(0))
                .mockReturnValueOnce(new Promise(resolve => (resolveCheck = resolve)));
            const { eligibility, stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(0);

            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS);

            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(2);
            expect(eligibility.isFetchingEligibility.value).toBe(false);
            expect(eligibility.eligibility.value).toEqual(inProgressEligibilityOf(0));
            resolveCheck(eligibilityOf(150));
            await vi.advanceTimersByTimeAsync(0);
            expect(eligibility.eligibility.value).toEqual(eligibilityOf(150));

            stop();
        });

        test('should stop checking after the longest the API takes to process a cashOut', async () => {
            endpoints.getCashOutEligibility!.mockImplementation(async () => inProgressEligibilityOf(0));
            const { stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(PROCESSING_LIMIT_MS);
            const calls = endpoints.getCashOutEligibility!.mock.calls.length;

            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 5);

            expect(endpoints.getCashOutEligibility!.mock.calls.length).toBe(calls);
            expect(calls).toBeLessThanOrEqual(PROCESSING_LIMIT_MS / CHECK_INTERVAL_MS + 1);

            stop();
        });

        test('should stop checking when a check fails, keeping what is shown', async () => {
            endpoints.getCashOutEligibility!.mockResolvedValueOnce(inProgressEligibilityOf(0)).mockRejectedValue(new Error('Internal error'));
            const { eligibility, stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(0);

            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 3);

            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(2);
            expect(eligibility.eligibility.value).toEqual(inProgressEligibilityOf(0));
            expect(eligibility.eligibilityError.value).toBeUndefined();

            stop();
        });

        test('should check the newly selected balance account only, once another is selected', async () => {
            endpoints.getCashOutEligibility!.mockImplementation(async (_: unknown, { path }: { path: { accountKey: string } }) =>
                path.accountKey === 'BalanceAccount.BA1' ? inProgressEligibilityOf(0) : eligibilityOf(200)
            );
            const { accountKey, stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(0);

            accountKey.value = 'BalanceAccount.BA2';
            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 3);

            expect(requestedAccountKeys()).toEqual(['BalanceAccount.BA1', 'BalanceAccount.BA2']);

            stop();
        });

        test('should stop checking once no longer used', async () => {
            endpoints.getCashOutEligibility!.mockImplementation(async () => inProgressEligibilityOf(0));
            const { stop } = renderEligibility();
            await vi.advanceTimersByTimeAsync(0);

            stop();
            await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 3);

            expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(1);
        });
    });

    test('should not check again while no cashOut is in progress', async () => {
        endpoints.getCashOutEligibility!.mockResolvedValue(eligibilityOf(100));
        const { stop } = renderEligibility();

        await vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS * 3);

        expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(1);

        stop();
    });
});
