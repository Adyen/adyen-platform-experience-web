/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useLandedPageEvent } from './useLandedPageEvent';
import useAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';

vi.mock('../../core/Context/analytics/useAnalyticsContext');

describe('useLandedPageEvent', () => {
    const mockAddEvent = vi.fn();
    const mockUseAnalyticsContext = vi.mocked(useAnalyticsContext);
    const eventProperties = { component: 'component', category: 'category', subCategory: 'subCategory' } as const;

    beforeEach(() => {
        mockUseAnalyticsContext.mockReturnValue({ addEvent: mockAddEvent });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('should log "Landed on page" event on initial render', () => {
        renderHook(() => useLandedPageEvent(eventProperties));
        expect(mockAddEvent).toHaveBeenCalledTimes(1);
        expect(mockAddEvent).toHaveBeenCalledWith('Landed on page', eventProperties);
    });

    test('should not log event on subsequent re-renders', () => {
        const { rerender } = renderHook(() => useLandedPageEvent(eventProperties));
        expect(mockAddEvent).toHaveBeenCalledTimes(1);

        rerender();
        expect(mockAddEvent).toHaveBeenCalledTimes(1);
    });

    test('should not log event again if eventProperties change', () => {
        const initialProperties = { ...eventProperties, component: 'InitialComponent' };
        const updatedProperties = { ...eventProperties, component: 'NewComponent' };
        const { rerender } = renderHook(props => useLandedPageEvent(props), { initialProps: initialProperties });

        expect(mockAddEvent).toHaveBeenCalledTimes(1);
        expect(mockAddEvent).toHaveBeenCalledWith('Landed on page', initialProperties);

        rerender(updatedProperties);
        expect(mockAddEvent).toHaveBeenCalledTimes(1);
    });
});
