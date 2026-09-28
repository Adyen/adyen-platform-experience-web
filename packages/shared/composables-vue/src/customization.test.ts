import { describe, expect, test, vi } from 'vitest';
import { useCoreContext } from '@integration-components/core/vue';
import { useCondensed, useShouldHideIllustrations, useShouldHideTitles } from './customization';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

describe('customization composables', () => {
    test('useShouldHideIllustrations reflects appearance state', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { illustrations: 'hidden' },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useShouldHideIllustrations().value).toBe(true);

        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { illustrations: 'visible' },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useShouldHideIllustrations().value).toBe(false);
    });

    test('useShouldHideTitles reflects appearance state', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { titles: 'hidden' },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useShouldHideTitles().value).toBe(true);

        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { titles: 'visible' },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useShouldHideTitles().value).toBe(false);
    });

    test('useCondensed reflects the target density', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            appearance: {
                density: {
                    dataGrid: 'condensed',
                },
            },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensed('dataGrid').value).toBe(true);

        vi.mocked(useCoreContext).mockReturnValue({
            appearance: {
                density: {
                    dataGrid: 'default',
                },
            },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensed('dataGrid').value).toBe(false);

        vi.mocked(useCoreContext).mockReturnValue({ appearance: {} } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensed('dataGrid').value).toBe(false);
    });
});
