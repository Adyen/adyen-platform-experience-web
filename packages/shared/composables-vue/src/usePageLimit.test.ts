import { describe, expect, test, vi } from 'vitest';
import { usePageLimit } from './usePageLimit';

const options = [10, 20, 30] as const;

describe('usePageLimit', () => {
    test('uses the default limit when it is one of the options', () => {
        const { initialLimit, limitOptions } = usePageLimit({ options, pagination: () => ({ defaultLimit: 30 }) });

        expect(initialLimit).toBe(30);
        expect(limitOptions.value).toEqual(options);
    });

    test('falls back to the default page limit when the default limit is not one of the options', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // @ts-expect-error unsupported limits are rejected at compile time; this covers untyped callers
        const { initialLimit } = usePageLimit({ options, pagination: () => ({ defaultLimit: 25 }) });

        expect(initialLimit).toBe(10);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith('pagination.defaultLimit "25" is not supported. Falling back to 10. Supported values: 10, 20, 30.');
        warn.mockRestore();
    });

    test('hides limit options when limit selection is disabled', () => {
        const { limitOptions } = usePageLimit({ options, pagination: () => ({ disableLimitSelection: true }) });

        expect(limitOptions.value).toBeUndefined();
    });
});
