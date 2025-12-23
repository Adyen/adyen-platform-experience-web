/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/preact';
import * as UseAnalyticsContext from '../../core/Context/analytics/useAnalyticsContext';
import useFilterAnalyticsEvent, { UseFilterAnalyticsEventProps } from './useFilterAnalyticsEvent';

vi.mock('../../core/Context/analytics/useAnalyticsContext');

describe('useFilterAnalyticsEvent', () => {
    const mockUseAnalyticsContext = vi.mocked(UseAnalyticsContext.default);

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAnalyticsContext.mockReturnValue({});
    });

    test('should return without logEvent callback if both event category and label are empty', () => {
        const emptyConfigurationProps: UseFilterAnalyticsEventProps[] = [
            { category: undefined, label: undefined },
            { category: undefined, label: '' as any },
            { category: undefined, label: 'Label' as any },
            { category: '', label: undefined },
            { category: '', label: '' as any },
            { category: '', label: 'Label' as any },
            { category: 'Category', label: undefined },
            { category: 'Category', label: '' as any },
        ];

        const { result, rerender } = renderHook((props?: UseFilterAnalyticsEventProps) => useFilterAnalyticsEvent(props ?? {}));
        const expectedResult = { logEvent: undefined };

        expect(result.current).toStrictEqual(expectedResult);

        emptyConfigurationProps.forEach(props => {
            rerender(props);
            expect(result.current).toStrictEqual(expectedResult);
        });
    });

    test('should return with logEvent callback if both event category and label are non-empty', () => {
        const { result } = renderHook(() => useFilterAnalyticsEvent({ category: 'Category', label: 'Label' as any }));
        expect(result.current).toStrictEqual({ logEvent: expect.any(Function) });
    });

    test('should create correct event object when logEvent callback is called', () => {
        const props: UseFilterAnalyticsEventProps = { category: 'Category', label: 'Label' as any };
        const addModifyFilterEvent = vi.fn();

        mockUseAnalyticsContext.mockReturnValue({ addModifyFilterEvent });

        const { result } = renderHook(() => useFilterAnalyticsEvent(props));
        const { logEvent } = result.current;

        logEvent?.('reset');
        expect(addModifyFilterEvent).toHaveBeenCalledOnce();
        expect(addModifyFilterEvent).toHaveBeenLastCalledWith({ ...props, actionType: 'reset' });

        logEvent?.('update', 123);
        expect(addModifyFilterEvent).toHaveBeenCalledTimes(2);
        expect(addModifyFilterEvent).toHaveBeenLastCalledWith({ ...props, actionType: 'update', value: 123 });
    });
});
