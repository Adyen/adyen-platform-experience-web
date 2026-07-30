/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/preact';
import { useFormatTermLabel } from './useFormatTermLabel';
import * as CoreContext from '@integration-components/core/preact';

vi.mock('@integration-components/core/preact');

const mockI18n = {
    get: vi.fn(),
};

describe('useFormatTermLabel', () => {
    const mockUseCoreContext = vi.mocked(CoreContext.useCoreContext);

    beforeEach(() => {
        vi.clearAllMocks();
        mockI18n.get.mockImplementation((key: string, options?: { values?: Record<string, unknown> }) => {
            const values = options?.values ?? {};
            const map: Record<string, string> = {
                'capital.common.values.oneMonth': '1 month',
                'capital.common.values.numberOfMonths': `${values['months']} months`,
                'capital.common.values.oneDay': '1 day',
                'capital.common.values.numberOfDays': `${values['days']} days`,
            };
            return map[key] ?? key;
        });
        mockUseCoreContext.mockReturnValue({ i18n: mockI18n } as unknown as ReturnType<typeof CoreContext.useCoreContext>);
    });

    const render = () => renderHook(() => useFormatTermLabel());

    test('returns "1 month" for exactly 30 days', () => {
        const { result } = render();
        expect(result.current(30)).toBe('1 month');
    });

    test('returns plural months for multiples of 30 days', () => {
        const { result } = render();
        expect(result.current(60)).toBe('2 months');
        expect(result.current(90)).toBe('3 months');
    });

    test('returns months and "1 day" when remainder is 1', () => {
        const { result } = render();
        expect(result.current(31)).toBe('1 month, 1 day');
        expect(result.current(61)).toBe('2 months, 1 day');
    });

    test('returns months and plural days when remainder is more than 1', () => {
        const { result } = render();
        expect(result.current(45)).toBe('1 month, 15 days');
        expect(result.current(75)).toBe('2 months, 15 days');
    });

    test('omits day part entirely when remainder is 0', () => {
        const { result } = render();
        const label = result.current(60);
        expect(label).toBe('2 months');
        expect(label).not.toContain('day');
    });
});
