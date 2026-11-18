/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, type App } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { IPaymentLinkItem } from '@integration-components/types';
import PaymentLinksTable from './PaymentLinksTable.vue';

let lastDataGridProps: { condensed?: boolean; loading?: boolean } = {};

vi.mock('@adyen/bento-vue3', () => ({
    BentoDataGrid: defineComponent({
        name: 'BentoDataGrid',
        props: { condensed: Boolean, loading: Boolean },
        setup(props) {
            lastDataGridProps = props;
            return () => h('div', { 'data-testid': 'bento-datagrid' });
        },
    }),
    BentoTag: { name: 'BentoTag' },
    BentoTypography: { name: 'BentoTypography' },
    BentoTooltipDirective: {},
    BentoEmptyState: defineComponent({
        props: { title: { type: String, default: undefined } },
        setup:
            (props, { slots }) =>
            () =>
                h('div', [h('h2', props.title), slots.default?.()]),
    }),
    BentoLoadingIndicator: () => h('div', { role: 'progressbar' }),
}));

vi.mock('@integration-components/core/vue', async () => {
    const { computed } = await import('vue');
    const useCoreContext = vi.fn();
    return {
        useCoreContext,
        useConfigContext: vi.fn(() => ({})),
        useShouldHideTitles: () => computed(() => useCoreContext().appearance?.titles === 'hidden'),
        useCondensedDataGrid: () => computed(() => useCoreContext().appearance?.dataGrid?.density === 'condensed'),
    };
});

describe('PaymentLinksTable', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    const i18n = {
        get: vi.fn((key: string) => key),
        amount: vi.fn((val: number, cur: string) => `${val} ${cur}`),
        date: vi.fn((d: string) => d),
    };

    const paymentLink = { paymentLinkId: 'PAYMENT_LINK_ID', amount: { value: 1000, currency: 'EUR' } } as IPaymentLinkItem;

    const mountTable = (props: Partial<InstanceType<typeof PaymentLinksTable>['$props']> = {}, appearance?: Record<string, unknown>) => {
        vi.mocked(useCoreContext).mockReturnValue({ i18n, appearance } as unknown as ReturnType<typeof useCoreContext>);
        app = createApp(PaymentLinksTable, { loading: false, showPagination: false, paymentLinks: [], ...props });
        target = document.createElement('div');
        app.mount(target);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        lastDataGridProps = {};
    });

    afterEach(() => {
        app?.unmount();
    });

    test('renders the translated no-results state instead of the grid when there are no payment links', () => {
        mountTable();

        expect(target.textContent).toContain('payByLink.overview.errors.listEmpty.title');
        expect(target.textContent).toContain('payByLink.overview.errors.listEmpty.message');
        expect(target.querySelector('[data-testid="bento-datagrid"]')).toBeNull();
    });

    test('renders the standalone loading state instead of the grid during the initial load', () => {
        mountTable({ loading: true });

        expect(target.querySelector('[aria-busy="true"]')).not.toBeNull();
        expect(target.querySelector('[data-testid="bento-datagrid"]')).toBeNull();
        expect(target.textContent).not.toContain('payByLink.overview.errors.listEmpty.title');
    });

    test('keeps the grid mounted with a loading state while refetching existing payment links', () => {
        mountTable({ loading: true, paymentLinks: [paymentLink] });

        expect(target.querySelector('[data-testid="bento-datagrid"]')).not.toBeNull();
        expect(target.querySelector('[aria-busy="true"]')).toBeNull();
        expect(lastDataGridProps.loading).toBe(true);
    });

    test('passes the condensed appearance to the grid when payment links are available', () => {
        mountTable({ paymentLinks: [paymentLink] }, { dataGrid: { density: 'condensed' } });

        expect(lastDataGridProps.condensed).toBe(true);
        expect(lastDataGridProps.loading).toBe(false);
    });
});
