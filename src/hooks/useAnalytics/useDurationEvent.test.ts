/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useDurationEvent } from './useDurationEvent';
import useComponentTiming from '../useComponentTiming';
import useAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';

vi.mock('../useComponentTiming');
vi.mock('../../core/Context/analytics/useAnalyticsContext');

describe('useDurationEvent', () => {
    const addEventMock = vi.fn();
    const mockedUseAnalyticsContext = vi.mocked(useAnalyticsContext);
    const mockedUseComponentTiming = vi.mocked(useComponentTiming);
    const eventProperties = { component: 'component', category: 'category', subCategory: 'subCategory' } as const;

    beforeEach(() => {
        mockedUseAnalyticsContext.mockReturnValue({ addEvent: addEventMock });
        mockedUseComponentTiming.mockReturnValue({ duration: { current: 1234 } });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('should send a duration event on unmount', () => {
        const { unmount } = renderHook(() => useDurationEvent(eventProperties));

        unmount();
        expect(addEventMock).toHaveBeenCalledTimes(1);
        expect(addEventMock).toHaveBeenCalledWith('Duration', { ...eventProperties, duration: 1234 });
    });

    test('should use the latest event properties if they change', () => {
        const initialProperties = { ...eventProperties, version: '1' };
        const updatedProperties = { ...eventProperties, version: '2' };
        const { rerender, unmount } = renderHook(props => useDurationEvent(props), { initialProps: initialProperties });

        rerender(updatedProperties);
        unmount();
        expect(addEventMock).toHaveBeenCalledWith('Duration', { ...updatedProperties, duration: 1234 });
    });

    test('should not send an event if the duration is not available', () => {
        mockedUseComponentTiming.mockReturnValue({ duration: { current: undefined } });
        const { unmount } = renderHook(() => useDurationEvent(eventProperties));

        unmount();
        expect(addEventMock).not.toHaveBeenCalled();
    });

    test('should floor the duration value', () => {
        mockedUseComponentTiming.mockReturnValue({ duration: { current: 5678.9 } });
        const { unmount } = renderHook(() => useDurationEvent(eventProperties));

        unmount();
        expect(addEventMock).toHaveBeenCalledWith('Duration', { ...eventProperties, duration: 5678 });
    });

    test('should send a duration event with duration 0', () => {
        mockedUseComponentTiming.mockReturnValue({ duration: { current: 0 } });
        const { unmount } = renderHook(() => useDurationEvent(eventProperties));

        unmount();
        expect(addEventMock).toHaveBeenCalledWith('Duration', { ...eventProperties, duration: 0 });
    });
});
