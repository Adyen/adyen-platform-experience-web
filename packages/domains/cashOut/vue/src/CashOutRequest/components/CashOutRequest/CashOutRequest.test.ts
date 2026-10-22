/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, nextTick, ref, toValue } from 'vue';
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

const formProps: { current?: Record<string, unknown> } = {};

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
    getCashOutErrorInfo: vi.fn(() => ({})),
    useCashOutState: vi.fn(),
}));

vi.mock('../CashOutRequestSkeleton/CashOutRequestSkeleton.vue', async () => {
    const { h } = await import('vue');
    return { default: () => h('div', 'skeleton') };
});

vi.mock('../CashOutRequestForm/CashOutRequestForm.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: {
                balanceAccountId: { type: String, required: true },
                eligibility: { type: Object, required: true },
                onDismiss: { type: Function, default: undefined },
                onContactSupport: { type: Function, default: undefined },
                onFeesError: { type: Function, required: true },
            },
            setup(props) {
                return () => {
                    formProps.current = { ...props };
                    return h('div', 'form');
                };
            },
        }),
    };
});

const mockCashOutState = (shellState: ComponentShellState) => {
    const state = {
        balanceAccountOptions: ref([]),
        eligibility: ref(shellState === 'ready' ? ELIGIBILITY : undefined),
        errorInfo: ref({}),
        selectedBalanceAccountId: ref('BA1'),
        shellState: ref(shellState),
    };
    vi.mocked(useCashOutState).mockReturnValue(state as unknown as ReturnType<typeof useCashOutState>);
    return state;
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
        formProps.current = undefined;
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
            expect(formProps.current).toBeUndefined();

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

    describe('Form', () => {
        test('should show the form of the selected balance account once eligibility loads', () => {
            const onDismiss = vi.fn();
            const onContactSupport = vi.fn();
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest({ onDismiss, onContactSupport });

            expect(target.textContent).toContain('form');
            expect(formProps.current).toMatchObject({
                balanceAccountId: 'BA1',
                eligibility: ELIGIBILITY,
                onDismiss,
                onContactSupport,
            });

            unmount();
        });

        test('should show an error when the fees fail to load', async () => {
            mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            (formProps.current?.onFeesError as (error: Error) => void)(new Error('error'));
            await nextTick();

            expect(target.textContent).toContain('error');
            expect(target.textContent).not.toContain('form');

            unmount();
        });

        test('should show the form of another balance account selected after the fees fail to load', async () => {
            const { selectedBalanceAccountId } = mockCashOutState('ready');
            const { target, unmount } = renderCashOutRequest();

            (formProps.current?.onFeesError as (error: Error) => void)(new Error('error'));
            await nextTick();

            selectedBalanceAccountId.value = 'BA2';
            await nextTick();

            expect(target.textContent).not.toContain('error');
            expect(target.textContent).toContain('form');
            expect(formProps.current).toMatchObject({ balanceAccountId: 'BA2' });

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
