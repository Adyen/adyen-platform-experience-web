import { describe, expect, test, vi } from 'vitest';
import { usePageLimit } from './usePageLimit';

const options = [10, 20, 30] as const;

describe('usePageLimit', () => {
    test('uses the preferred limit when it is one of the options', () => {
        const { initialLimit, limitOptions } = usePageLimit({ options, preferredLimit: () => 30, allowLimitSelection: () => undefined });

        expect(initialLimit).toBe(30);
        expect(limitOptions.value).toEqual(options);
    });

    test('falls back to the default limit when the preferred limit is not one of the options', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { initialLimit } = usePageLimit({ options, preferredLimit: () => 25, allowLimitSelection: () => undefined });

        expect(initialLimit).toBe(10);
        expect(warn).toHaveBeenCalledOnce();
        expect(warn).toHaveBeenCalledWith('preferredLimit "25" is not supported. Falling back to 10. Supported values: 10, 20, 30.');
        warn.mockRestore();
    });

    test('hides limit options when limit selection is disabled', () => {
        const { limitOptions } = usePageLimit({ options, preferredLimit: () => undefined, allowLimitSelection: () => false });

        expect(limitOptions.value).toBeUndefined();
    });
});
