/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, toValue } from 'vue';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { ICashOutEligibility } from '@integration-components/types';
import type { CashOutAnalytics } from './useCashOutAnalytics';
import { useCashOutLoadAnalytics } from './useCashOutLoadAnalytics';

vi.mock('@integration-components/composables-vue', () => ({
    useLandedPageEvent: vi.fn(),
}));

const ERROR = { type: 'HTTP_ERROR', status: '500' } as unknown as AdyenPlatformExperienceError;

type LoadingError = { request: 'balanceAccounts' | 'eligibility'; error: AdyenPlatformExperienceError | undefined } | undefined;

const renderLoadAnalytics = (initialError: LoadingError, tracksLanding = true, eligibility?: ICashOutEligibility) => {
    const trackBackendError = vi.fn();
    const loadingError = ref<LoadingError>(initialError);
    const app = createApp({
        setup() {
            useCashOutLoadAnalytics({ trackBackendError } as unknown as CashOutAnalytics, {
                eligibility,
                balanceAccountCount: 1,
                loadingError,
                tracksLanding,
            });
            return () => null;
        },
    });
    app.mount(document.createElement('div'));
    return { loadingError, trackBackendError, unmount: () => app.unmount() };
};

describe('useCashOutLoadAnalytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should tell which request kept the component from loading once it fails', async () => {
        const { loadingError, trackBackendError, unmount } = renderLoadAnalytics(undefined);
        expect(trackBackendError).not.toHaveBeenCalled();

        loadingError.value = { request: 'eligibility', error: ERROR };
        await nextTick();

        expect(trackBackendError).toHaveBeenCalledExactlyOnceWith('eligibility', ERROR);

        unmount();
    });

    // Such as an error a request kept, which the component would show from the start
    test('should tell a request that failed before the component was set up', () => {
        const { trackBackendError, unmount } = renderLoadAnalytics({ request: 'balanceAccounts', error: ERROR });

        expect(trackBackendError).toHaveBeenCalledExactlyOnceWith('balanceAccounts', ERROR);

        unmount();
    });

    // Such as the request in the modal of the overview, whose landing the overview tells, but which loads on its own
    test('should still tell which request kept the component from loading where another component tells its landing', () => {
        const { trackBackendError, unmount } = renderLoadAnalytics({ request: 'eligibility', error: ERROR }, false, {} as ICashOutEligibility);

        const [, landingEnabled] = vi.mocked(useLandedPageEvent).mock.calls[0]!;
        expect(toValue(landingEnabled)).toBe(false);
        expect(trackBackendError).toHaveBeenCalledExactlyOnceWith('eligibility', ERROR);

        unmount();
    });
});
