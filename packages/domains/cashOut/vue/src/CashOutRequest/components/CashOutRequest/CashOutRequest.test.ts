/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, ref, toValue } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ComponentShellState } from '@integration-components/composables-vue';
import type { ICashOutEligibility } from '@integration-components/types';
import { useCashOutState } from '../../../shared/composables/useCashOutState';
import type { CashOutRequestProps } from '../../types';
import CashOutRequest from './CashOutRequest.vue';

const TITLE = 'cashOut.request.title';
const SKELETON = 'skeleton';

const ELIGIBILITY = {
    isCashoutAvailable: true,
    availableForCashOutBalance: { value: 22000, currency: 'USD' },
    unavailableReasons: [],
} as unknown as ICashOutEligibility;

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    const stub = (props: { title?: string }, { slots }: { slots: Record<string, (() => unknown) | undefined> }) =>
        h('div', [props.title, ...Object.values(slots).map(slot => slot?.())] as never);

    return {
        BentoDropdown: stub,
        BentoHeader: stub,
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@integration-components/composables-vue', async () => {
    const { h } = await import('vue');

    return {
        ComponentShell: (props: { state: string }, { slots }: { slots: { default?: () => unknown; loading?: () => unknown } }) => {
            if (props.state === 'loading') return h('div', ['loading', slots.loading?.()] as never);
            if (props.state === 'error') return h('div', 'error');
            return h('div', ['ready', slots.default?.()] as never);
        },
    };
});

vi.mock('../../../shared/composables/useCashOutState', () => ({
    useCashOutState: vi.fn(),
}));

vi.mock('../CashOutRequestSkeleton/CashOutRequestSkeleton.vue', async () => {
    const { h } = await import('vue');
    return { default: () => h('div', 'skeleton') };
});

const mockCashOutState = (shellState: ComponentShellState) => {
    vi.mocked(useCashOutState).mockReturnValue({
        balanceAccountOptions: ref([]),
        eligibility: ref(shellState === 'ready' ? ELIGIBILITY : undefined),
        errorInfo: ref({}),
        selectedBalanceAccountId: ref('BA1'),
        shellState: ref(shellState),
    } as unknown as ReturnType<typeof useCashOutState>);
};

const renderCashOutRequest = (props: Partial<CashOutRequestProps> = {}) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequest, props);
    app.mount(target);
    return { target, unmount: () => app.unmount() };
};

describe('CashOutRequest', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    describe('Title', () => {
        test('should show the title', () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain(TITLE);

            unmount();
        });

        test('should not show the title when hideTitle is set', () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ hideTitle: true });

            expect(target.textContent).not.toContain(TITLE);

            unmount();
        });
    });

    describe('Loading', () => {
        test('should show the skeleton while eligibility loads', () => {
            mockCashOutState('loading');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain('loading');
            expect(target.textContent).toContain(SKELETON);

            unmount();
        });

        test('should keep the skeleton layout as a placeholder once eligibility loads, so the height does not change', () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain('ready');
            expect(target.textContent).toContain(SKELETON);

            unmount();
        });

        test('should show an error when the data fails to load', () => {
            mockCashOutState('error');
            const { target, unmount } = renderCashOutRequest();

            expect(target.textContent).toContain('error');
            expect(target.textContent).not.toContain(SKELETON);

            unmount();
        });
    });

    test('should start from the given balance account and its eligibility', () => {
        mockCashOutState('ready');
        const { unmount } = renderCashOutRequest({ balanceAccountId: 'BA2', eligibility: ELIGIBILITY });

        const [options] = vi.mocked(useCashOutState).mock.calls[0]!;
        expect(toValue(options?.balanceAccountId)).toBe('BA2');
        expect(toValue(options?.eligibility)).toBe(ELIGIBILITY);

        unmount();
    });
});
