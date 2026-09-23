import { describe, expect, test, vi } from 'vitest';
import { useCoreContext } from '@integration-components/core/vue';
import { useCondensed, useDensity, useShouldHideIllustrations, useShouldHideTitles } from './customization';

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

    test('useDensity resolves target density object', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            appearance: {
                density: {
                    dataGrid: 'condensed',
                },
            },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useDensity('dataGrid').value).toBe('condensed');
        expect(useDensity('otherTarget').value).toBe('default');
    });

    test('useCondensed returns boolean based on density', () => {
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
    });
});
