/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import PaymentLinksTable from './PaymentLinksTable.vue';

let lastDataGridProps: Record<string, any> = {};

vi.mock('@adyen/bento-vue3', () => ({
    BentoDataGrid: defineComponent({
        name: 'BentoDataGrid',
        props: { emptyState: { type: Object, default: undefined } },
        setup(props) {
            lastDataGridProps = props;
            return () => h('div', { 'data-testid': 'bento-datagrid' });
        },
    }),
    BentoTag: { name: 'BentoTag' },
    BentoTypography: { name: 'BentoTypography' },
    BentoTooltipDirective: {},
}));

vi.mock('@integration-components/core/vue', async () => {
    const { computed } = await import('vue');
    const useCoreContext = vi.fn();
    return {
        useCoreContext,
        useConfigContext: vi.fn(() => ({})),
        useShouldHideIllustrations: () => computed(() => useCoreContext().appearance?.illustrations === 'hidden'),
        useShouldHideTitles: () => computed(() => useCoreContext().appearance?.titles === 'hidden'),
        useCondensedDataGrid: () => computed(() => useCoreContext().appearance?.dataGrid?.density === 'condensed'),
    };
});

describe('PaymentLinksTable', () => {
    const i18n = {
        get: vi.fn((key: string) => key),
        amount: vi.fn((val: number, cur: string) => `${val} ${cur}`),
        date: vi.fn((d: string) => d),
    };

    const mountTable = (appearance?: Record<string, unknown>) => {
        vi.mocked(useCoreContext).mockReturnValue({ i18n, appearance } as unknown as ReturnType<typeof useCoreContext>);
        const app = createApp(PaymentLinksTable, { loading: false, showPagination: false, paymentLinks: [] });
        app.mount(document.createElement('div'));
        return app;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        lastDataGridProps = {};
    });

    test('shows the empty state illustration by default', () => {
        const app = mountTable();

        expect(lastDataGridProps.emptyState.image).toBe('no-results-found');

        app.unmount();
    });

    test('hides the empty state illustration when illustrations are hidden', () => {
        const app = mountTable({ illustrations: 'hidden' });

        expect(lastDataGridProps.emptyState.image).toBeUndefined();

        app.unmount();
    });
});
