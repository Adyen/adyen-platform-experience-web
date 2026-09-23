/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/no-deprecated-data-object-declaration, vue/no-shared-component-data */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import PayoutsTable from './PayoutsTable.vue';

let lastDataGridProps: Record<string, any> = {};

vi.mock('@adyen/bento-vue3', () => ({
    BentoDataGrid: defineComponent({
        name: 'BentoDataGrid',
        props: ['condensed', 'emptyState', 'columns', 'data', 'loading', 'pagination'],
        setup(props) {
            lastDataGridProps = props;
            return () => h('div', { 'data-testid': 'bento-datagrid' });
        },
    }),
    BentoTypography: { name: 'BentoTypography' },
}));

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    useConfigContext: vi.fn(),
}));

describe('PayoutsTable', () => {
    const i18n = {
        get: vi.fn((key: string) => key),
        amount: vi.fn((val: number, cur: string) => `${val} ${cur}`),
        date: vi.fn((d: string) => d),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        lastDataGridProps = {};
        vi.mocked(useConfigContext).mockReturnValue({} as any);
    });

    test('passes condensed: true to BentoDataGrid when density.dataGrid is condensed', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: {
                density: {
                    dataGrid: 'condensed',
                },
            },
        } as unknown as ReturnType<typeof useCoreContext>);

        const target = document.createElement('div');
        const app = createApp(PayoutsTable, {
            balanceAccountId: 'BA123',
            loading: false,
            showPagination: false,
            data: [],
        });
        app.mount(target);

        expect(lastDataGridProps.condensed).toBe(true);

        app.unmount();
    });

    test('hides illustration in emptyState when illustrations is hidden', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: {
                illustrations: 'hidden',
            },
        } as unknown as ReturnType<typeof useCoreContext>);

        const target = document.createElement('div');
        const app = createApp(PayoutsTable, {
            balanceAccountId: 'BA123',
            loading: false,
            showPagination: false,
            data: [],
        });
        app.mount(target);

        expect(lastDataGridProps.emptyState?.image).toBeUndefined();

        app.unmount();
    });

    test('includes illustration in emptyState by default', () => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            appearance: {},
        } as unknown as ReturnType<typeof useCoreContext>);

        const target = document.createElement('div');
        const app = createApp(PayoutsTable, {
            balanceAccountId: 'BA123',
            loading: false,
            showPagination: false,
            data: [],
        });
        app.mount(target);

        expect(lastDataGridProps.emptyState?.image).toBe('no-results-found');

        app.unmount();
    });
});
