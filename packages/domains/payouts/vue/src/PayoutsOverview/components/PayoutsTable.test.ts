/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import type { IPayout } from '@integration-components/types';
import PayoutsTable from './PayoutsTable.vue';

let lastDataGridProps: Record<string, any> = {};

vi.mock('@adyen/bento-vue3', () => ({
    BentoDataGrid: defineComponent({
        name: 'BentoDataGrid',
        props: { condensed: Boolean, loading: Boolean },
        setup(props) {
            lastDataGridProps = props;
            return () => h('div', { 'data-testid': 'bento-datagrid' });
        },
    }),
    BentoTypography: { name: 'BentoTypography' },
    BentoEmptyState: { name: 'BentoEmptyState' },
}));

vi.mock('@integration-components/composables-vue', async importOriginal => {
    const actual = await importOriginal<typeof import('@integration-components/composables-vue')>();
    return {
        ...actual,
        DataOverviewError: defineComponent({
            name: 'DataOverviewError',
            setup: () => () => h('div', { 'data-testid': 'data-overview-error' }),
        }),
        DataOverviewLoading: defineComponent({
            name: 'DataOverviewLoading',
            setup: () => () => h('div', { 'data-testid': 'data-overview-loading' }),
        }),
    };
});

vi.mock('@integration-components/core/vue', async () => {
    const { computed } = await import('vue');
    const useCoreContext = vi.fn();
    return {
        useCoreContext,
        useConfigContext: vi.fn(),
        useShouldHideTitles: () => computed(() => useCoreContext().appearance?.titles === 'hidden'),
        useCondensedDataGrid: () => computed(() => useCoreContext().appearance?.dataGrid?.density === 'condensed'),
    };
});

describe('PayoutsTable', () => {
    const i18n = {
        get: vi.fn((key: string) => key),
        amount: vi.fn((val: number, cur: string) => `${val} ${cur}`),
        date: vi.fn((d: string) => d),
    };

    const payout = { createdAt: '2026-11-01T10:00:00Z', payoutAmount: { value: 1000, currency: 'EUR' } } as IPayout;

    function mountTable(rootProps: Record<string, any>) {
        const target = document.createElement('div');
        const app = createApp(PayoutsTable, {
            balanceAccountId: 'BA123',
            showPagination: false,
            ...rootProps,
        });
        app.mount(target);
        return { target, app };
    }

    beforeEach(() => {
        vi.clearAllMocks();
        lastDataGridProps = {};
        vi.mocked(useConfigContext).mockReturnValue({} as any);
    });

    test('renders the standalone loading state, not the grid, during the initial load', () => {
        vi.mocked(useCoreContext).mockReturnValue({ i18n } as unknown as ReturnType<typeof useCoreContext>);

        const { target, app } = mountTable({ loading: true, data: [] });

        expect(target.querySelector('[data-testid="data-overview-loading"]')).not.toBeNull();
        expect(target.querySelector('[data-testid="bento-datagrid"]')).toBeNull();

        app.unmount();
    });

    test('keeps the grid mounted with loading: true while refetching existing data', () => {
        vi.mocked(useCoreContext).mockReturnValue({ i18n } as unknown as ReturnType<typeof useCoreContext>);

        const { target, app } = mountTable({ loading: true, data: [payout] });

        expect(target.querySelector('[data-testid="bento-datagrid"]')).not.toBeNull();
        expect(target.querySelector('[data-testid="data-overview-loading"]')).toBeNull();
        expect(lastDataGridProps.loading).toBe(true);

        app.unmount();
    });

    test('renders the no-results state once loading finished without records', () => {
        vi.mocked(useCoreContext).mockReturnValue({ i18n } as unknown as ReturnType<typeof useCoreContext>);

        const { target, app } = mountTable({ loading: false, data: [] });

        expect(target.querySelector('[data-testid="data-overview-error"]')).not.toBeNull();
        expect(target.querySelector('[data-testid="bento-datagrid"]')).toBeNull();

        app.unmount();
    });

    test('passes condensed: true to BentoDataGrid when dataGrid.density is condensed', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: { dataGrid: { density: 'condensed' } },
        } as unknown as ReturnType<typeof useCoreContext>);

        const { app } = mountTable({ loading: false, data: [payout] });

        expect(lastDataGridProps.condensed).toBe(true);
        expect(lastDataGridProps.loading).toBe(false);

        app.unmount();
    });
});
