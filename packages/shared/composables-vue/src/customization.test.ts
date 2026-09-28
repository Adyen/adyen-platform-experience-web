import { describe, expect, test, vi } from 'vitest';
import { useCoreContext } from '@integration-components/core/vue';
import { useCondensedDataGrid, useShouldHideIllustrations, useShouldHideTitles } from './customization';

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

    test('useCondensedDataGrid reflects the data grid density', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { dataGrid: { density: 'condensed' } },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensedDataGrid().value).toBe(true);

        vi.mocked(useCoreContext).mockReturnValue({
            appearance: { dataGrid: { density: 'default' } },
        } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensedDataGrid().value).toBe(false);

        vi.mocked(useCoreContext).mockReturnValue({ appearance: {} } as unknown as ReturnType<typeof useCoreContext>);

        expect(useCondensedDataGrid().value).toBe(false);
    });
});
